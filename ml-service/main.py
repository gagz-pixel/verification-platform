import uuid
import time
import random
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware

from face_service import extract_embedding
from voice_service import (
    extract_voice_embedding,
    transcribe_audio,
    cosine_similarity,
    phrase_matches,
    average_embeddings,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

challenge_store = {}

# Enrollment buffer + timestamps for auto-cleanup
enrollment_buffer = {}
enrollment_timestamps = {}

CHALLENGE_PHRASES = [
    "My voice is my password",
    "The sky is blue today",
    "Verify my identity now",
    "I am who I say I am",
    "Open the secure vault",
    "Biometrics keep me safe",
    "Authentication is complete",
    "Trust no one but yourself",
    "Speak now or forever hold",
    "The quick brown fox jumps",
    "Security starts with me",
    "My fingerprint is unique",
    "Access granted to this system",
    "Hello this is my voice",
    "Confirm my voice today",
    "The eagle has landed safely",
    "Sunrise over the mountains",
    "My identity cannot be stolen",
    "Digital security is important",
    "Protect what matters most",
]


# ════════════════════════════════════════════════════════
# FACE ENDPOINT
# ════════════════════════════════════════════════════════

@app.post("/extract-embedding")
async def get_face_embedding(file: UploadFile = File(...)):
    image_bytes = await file.read()
    embedding = extract_embedding(image_bytes)
    if embedding is None:
        return {"success": False, "embedding": None}
    return {"success": True, "embedding": embedding}


# ════════════════════════════════════════════════════════
# VOICE ENDPOINT 1 — Get Challenge Phrase
# ════════════════════════════════════════════════════════

@app.get("/voice/challenge")
async def get_voice_challenge():
    now = time.time()
    # Clean up expired sessions
    expired = [k for k, v in challenge_store.items() if v["expires_at"] < now]
    for k in expired:
        del challenge_store[k]

    phrase = random.choice(CHALLENGE_PHRASES)
    session_token = str(uuid.uuid4())
    expires_at = now + 60  # ✅ increased to 60s for better UX

    challenge_store[session_token] = {
        "phrase": phrase,
        "expires_at": expires_at,
    }

    return {
        "success": True,
        "phrase": phrase,
        "session_token": session_token,
        "expires_in": 60,
    }


# ════════════════════════════════════════════════════════
# VOICE ENDPOINT 2 — Enroll Voice
# ════════════════════════════════════════════════════════

@app.post("/voice/enroll")
async def enroll_voice(
    user_id: str,
    sample_number: int,
    session_token: str,
    file: UploadFile = File(...),
):
    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio received")

    # ── Cleanup stale enrollment buffers (older than 10 mins) ────────────────
    now = time.time()
    stale = [uid for uid, ts in enrollment_timestamps.items() if now - ts > 600]
    for uid in stale:
        enrollment_buffer.pop(uid, None)
        enrollment_timestamps.pop(uid, None)

    # ── Validate session token ────────────────────────────────────────────────
    session = challenge_store.get(session_token)
    if not session or session["expires_at"] < now:
        if session:
            del challenge_store[session_token]
        return {"success": False, "message": "Challenge expired. Please try again.", "sample_number": sample_number}

    expected_phrase = session["phrase"]
    del challenge_store[session_token]

    # ── Extract embedding ─────────────────────────────────────────────────────
    embedding = extract_voice_embedding(audio_bytes)
    if embedding is None:
        return {"success": False, "message": "Could not extract voice. Please speak clearly.", "sample_number": sample_number}

    # ── Validate spoken phrase ────────────────────────────────────────────────
    transcript = transcribe_audio(audio_bytes)
    if not phrase_matches(transcript, expected_phrase):
        return {
            "success": False,
            "message": f"Please read the exact phrase shown. Heard: '{transcript}'",
            "sample_number": sample_number,
        }

    # ── Accumulate samples ────────────────────────────────────────────────────
    if user_id not in enrollment_buffer:
        enrollment_buffer[user_id] = []
    enrollment_buffer[user_id].append(embedding)
    enrollment_timestamps[user_id] = now

    if sample_number < 3:
        return {
            "success": True,
            "message": f"Sample {sample_number} recorded. {3 - sample_number} more needed.",
            "sample_number": sample_number,
            "embedding": None,
            "done": False,
        }

    all_embeddings = enrollment_buffer.pop(user_id, [])
    enrollment_timestamps.pop(user_id, None)

    if len(all_embeddings) < 1:
        return {"success": False, "message": "Enrollment failed. No valid samples collected."}

    final_embedding = average_embeddings(all_embeddings)

    return {
        "success": True,
        "message": "Voice enrolled successfully",
        "sample_number": 3,
        "embedding": final_embedding,
        "embedding_length": len(final_embedding),
        "done": True,
    }


# ════════════════════════════════════════════════════════
# VOICE ENDPOINT 3 — Verify Voice
# ════════════════════════════════════════════════════════

@app.post("/voice/verify")
async def verify_voice(
    user_id: str,
    session_token: str,
    file: UploadFile = File(...),
    stored_embedding: str = Form(...),   # ✅ now from POST body, not URL
):
    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio received")

    now = time.time()
    session = challenge_store.get(session_token)

    if not session:
        return {"success": False, "match": False, "status": "EXPIRED", "message": "Challenge expired or invalid."}

    if session["expires_at"] < now:
        del challenge_store[session_token]
        return {"success": False, "match": False, "status": "EXPIRED", "message": "Challenge phrase expired."}

    expected_phrase = session["phrase"]
    del challenge_store[session_token]

    try:
        stored_emb = json.loads(stored_embedding)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid stored_embedding format")

    new_embedding = extract_voice_embedding(audio_bytes)
    if new_embedding is None:
        return {"success": True, "match": False, "confidence": 0.0, "phrase_match": False, "status": "NO_VOICE", "message": "No voice detected."}

    transcript = transcribe_audio(audio_bytes)
    phrase_match = phrase_matches(transcript, expected_phrase)
    confidence = cosine_similarity(stored_emb, new_embedding)

    THRESHOLD_PASS = 0.75
    THRESHOLD_WARN = 0.50

    if confidence >= THRESHOLD_PASS and phrase_match:
        status, match = "SUCCESS", True
    elif confidence >= THRESHOLD_WARN and phrase_match:
        status, match = "LOW_CONFIDENCE", False
    else:
        status, match = "FAILED", False

    return {
        "success": True,
        "match": match,
        "confidence": round(confidence, 4),
        "phrase_match": phrase_match,
        "transcript": transcript,
        "expected_phrase": expected_phrase,
        "status": status,
        "message": "Voice verified successfully" if match else f"Verification failed — confidence {round(confidence * 100, 1)}%",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "face": True, "voice": True}