import io
import tempfile
import os
import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav
from faster_whisper import WhisperModel
from pydub import AudioSegment

# ── Load models once at startup (not on every request) ───────────────────────
print("Loading Resemblyzer encoder...")
encoder = VoiceEncoder()

print("Loading Whisper model (small)...")
whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

print("Voice models ready.")


# ── Helper: convert any audio bytes → 16kHz mono WAV temp file ───────────────
def bytes_to_temp_wav(audio_bytes: bytes) -> str:
    """
    Converts raw audio bytes (WebM, OGG, WAV, MP4, etc.) to a
    proper 16kHz mono WAV temp file using pydub.
    Returns the file path. Caller is responsible for deleting it.
    """
    # Write raw bytes to a temp file with no extension so pydub auto-detects
    tmp_in = tempfile.NamedTemporaryFile(suffix=".webm", delete=False)
    tmp_in.write(audio_bytes)
    tmp_in.close()

    tmp_out = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp_out.close()

    try:
        # pydub auto-detects format from content
        audio = AudioSegment.from_file(tmp_in.name)

        # Convert to 16kHz mono WAV — required by Resemblyzer and Whisper
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(tmp_out.name, format="wav")

    finally:
        # Always clean up the input temp file
        if os.path.exists(tmp_in.name):
            os.remove(tmp_in.name)

    return tmp_out.name


# ── FUNCTION 1: Extract speaker embedding ─────────────────────────────────────
def extract_voice_embedding(audio_bytes: bytes):
    """
    Takes raw audio bytes (WebM/WAV/any format).
    Converts to 16kHz mono WAV, then extracts 256-dim Resemblyzer embedding.
    Returns None if audio is too short, silent, or has insufficient energy.
    """
    tmp_path = None
    try:
        tmp_path = bytes_to_temp_wav(audio_bytes)

        # preprocess_wav: loads WAV, resamples to 16kHz, normalises
        wav = preprocess_wav(tmp_path)

        # Need at least 1 second of audio (16000 samples @ 16kHz)
        if len(wav) < 16000:
            print(f"Audio too short: {len(wav)} samples (need >= 16000)")
            return None

        # Reject silence / very low energy audio
        rms = float(np.sqrt(np.mean(wav ** 2)))
        print(f"Audio RMS energy: {rms:.6f}")
        if rms < 0.01:
            print("Audio too quiet — likely silence")
            return None

        embedding = encoder.embed_utterance(wav)
        return embedding.tolist()

    except Exception as e:
        print(f"Error extracting voice embedding: {e}")
        return None

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── FUNCTION 2: Transcribe audio ──────────────────────────────────────────────
def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Takes raw audio bytes (any format).
    Returns transcribed text string (lowercase, stripped).
    Returns empty string on failure or if audio is silent.
    """
    tmp_path = None
    try:
        tmp_path = bytes_to_temp_wav(audio_bytes)

        # Check audio energy — reject silence to prevent Whisper hallucinations
        wav = preprocess_wav(tmp_path)
        rms = float(np.sqrt(np.mean(wav ** 2)))
        if rms < 0.01:
            print("Transcription skipped — audio is silent")
            return ""

        segments, _ = whisper_model.transcribe(tmp_path, language="en")
        transcript = " ".join([seg.text for seg in segments]).strip().lower()

        print(f"Transcript: '{transcript}'")
        return transcript

    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── FUNCTION 3: Cosine similarity between two embeddings ──────────────────────
def cosine_similarity(embedding1: list, embedding2: list) -> float:
    """
    Computes cosine similarity between two embedding vectors.
    Returns a float between -1 and 1. Higher = more similar.
    """
    a = np.array(embedding1)
    b = np.array(embedding2)

    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot / (norm_a * norm_b))


# ── FUNCTION 4: Check if transcript matches expected phrase ───────────────────
def phrase_matches(transcript: str, expected_phrase: str) -> bool:
    """
    Checks if the transcript contains all key words from the expected phrase.
    Uses word-level matching (not substring) for accuracy.
    Returns True if 70%+ of key words are found in transcript.
    """
    STOP_WORDS = {"the", "a", "an", "is", "are", "was", "and", "or", "i", "my", "in", "on", "at"}

    expected_words = [
        w.lower().strip(".,!?")
        for w in expected_phrase.split()
        if w.lower() not in STOP_WORDS
    ]

    if not expected_words:
        return True

    # Split transcript into individual words for accurate matching
    transcript_words = set(
        w.lower().strip(".,!?")
        for w in transcript.split()
    )

    matched = sum(1 for w in expected_words if w in transcript_words)
    match_ratio = matched / len(expected_words)

    print(f"Phrase match ratio: {match_ratio:.2f} ({matched}/{len(expected_words)} words)")
    return match_ratio >= 0.70


# ── FUNCTION 5: Average multiple enrollment embeddings ────────────────────────
def average_embeddings(embeddings: list) -> list:
    """
    Takes a list of embedding arrays (from 3 enrollment samples).
    Returns a single averaged, re-normalised embedding as a list.
    """
    arr = np.array(embeddings)
    avg = np.mean(arr, axis=0)

    # Re-normalize to unit vector
    norm = np.linalg.norm(avg)
    if norm > 0:
        avg = avg / norm

    return avg.tolist()