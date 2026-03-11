import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WaveformVisualizer from "../components/WaveformVisualizer";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import AnimatedBackground from "../components/AnimatedBackground";
import GlowButton from "../components/GlowButton";

const STEPS = { INSTRUCTIONS: 0, CHALLENGE: 1, RECORDING: 2, PROCESSING: 3, SUCCESS: 4, ERROR: 5 };

const MicIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const CheckIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const FingerprintIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
  </svg>
);

export default function VoiceEnroll() {
  useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.INSTRUCTIONS);
  const [sampleNumber, setSampleNumber] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState("");
  const [audioBlobs, setAudioBlobs] = useState([]);
  const [phrase, setPhrase] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const fetchChallenge = async () => {
    try {
      const res = await apiClient.get("/voice/challenge");
      setPhrase(res.data.phrase);
      setSessionToken(res.data.session_token);
    } catch {
      setError("Failed to fetch challenge phrase. Please try again.");
      setStep(STEPS.ERROR);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => { setRecordingDuration((prev) => prev + 1); }, 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
      setStep(STEPS.ERROR);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return resolve(null);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    });
  };

  const handleStopAndSubmit = async () => {
    const blob = await stopRecording();
    if (!blob) { setError("No audio recorded. Please try again."); setStep(STEPS.ERROR); return; }
    const updatedBlobs = [...audioBlobs, blob];
    setAudioBlobs(updatedBlobs);
    setStep(STEPS.PROCESSING);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("sample_number", sampleNumber);
      formData.append("session_token", sessionToken);
      const response = await apiClient.post("/voice/enroll", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = response.data;
      if (!data.success) { setError(data.message || "Sample rejected. Please try again."); setStep(STEPS.ERROR); return; }
      if (data.done) { localStorage.setItem("voice_enrolled", "true"); setStep(STEPS.SUCCESS); }
      else { setSampleNumber((prev) => prev + 1); setStep(STEPS.CHALLENGE); await fetchChallenge(); }
    } catch (err) {
      console.error("Voice enroll error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to submit sample. Please check your connection.";
      setError(msg); setStep(STEPS.ERROR);
    }
  };

  const sectionStyle = { display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" };

  return (
    <div className="page-wrapper">
      <AnimatedBackground />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 16px 44px" }}>

        <motion.div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "26px" }}
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
            whileHover={{ scale: 1.08, rotate: 5 }}>
            <FingerprintIcon />
          </motion.div>
          <div>
            <div style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a" }}>VerifyAI</div>
            <div style={{ fontSize: "10.5px", fontWeight: 500, color: "#64748b", fontFamily: "'Inter', sans-serif" }}>Voice Enrollment</div>
          </div>
        </motion.div>

        <motion.div style={{ width: "100%", maxWidth: "490px" }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>

          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                style={{ width: 52, height: 52, borderRadius: "50%", background: "#eef2ff", border: "1.5px solid #c7d2fe", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "#6366f1" }}>
                <MicIcon size={24} />
              </motion.div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Voice Enrollment</div>
              <div style={{ fontSize: "13.5px", color: "#64748b" }}>We need 3 voice samples to build your voiceprint</div>
            </div>

            {(step === STEPS.CHALLENGE || step === STEPS.RECORDING || step === STEPS.PROCESSING) && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                {[1, 2, 3].map((n) => (
                  <motion.div key={n} style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${n < sampleNumber ? "#22c55e" : n === sampleNumber ? "#8b5cf6" : "#e2e8f0"}`, background: n < sampleNumber ? "#22c55e" : n === sampleNumber ? "#8b5cf6" : "transparent", transition: "all 0.4s ease" }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: n * 0.08, type: "spring" }} />
                ))}
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Inter', sans-serif", fontWeight: 500, marginLeft: 4 }}>Sample {sampleNumber}/3</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === STEPS.INSTRUCTIONS && (
                <motion.div key="instructions" style={sectionStyle}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Record 3 short voice samples", "Speak clearly at normal volume", "Find a quiet environment", "Each sample is 3-5 seconds", "Read the phrase shown on screen"].map((text, i) => (
                      <motion.div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />
                        {text}
                      </motion.div>
                    ))}
                  </div>
                  <GlowButton fullWidth onClick={async () => { await fetchChallenge(); setStep(STEPS.CHALLENGE); }}>
                    Start Enrollment
                  </GlowButton>
                </motion.div>
              )}

              {step === STEPS.CHALLENGE && (
                <motion.div key="challenge" style={sectionStyle}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div style={{ fontSize: "13.5px", color: "#64748b", textAlign: "center", fontWeight: 500 }}>Read this phrase aloud when you press record:</div>
                  <motion.div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "18px 24px", width: "100%", textAlign: "center" }}
                    initial={{ scale: 0.97 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", fontStyle: "italic" }}>&ldquo;{phrase}&rdquo;</span>
                  </motion.div>
                  <WaveformVisualizer isRecording={false} height={60} color="rgba(139,92,246,0.3)" />
                  <GlowButton fullWidth onClick={() => { setStep(STEPS.RECORDING); startRecording(); }}
                    icon={<MicIcon size={16} />}>Start Recording</GlowButton>
                </motion.div>
              )}

              {step === STEPS.RECORDING && (
                <motion.div key="recording" style={sectionStyle}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#f87171" }}>
                    <motion.div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    Recording — speak now
                  </div>
                  <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "18px 24px", width: "100%", textAlign: "center" }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", fontStyle: "italic" }}>&ldquo;{phrase}&rdquo;</span>
                  </div>
                  <WaveformVisualizer isRecording={isRecording} height={80} color="#8b5cf6" />
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#dc2626", fontFamily: "'Inter', sans-serif" }}>{recordingDuration}s</div>
                  <GlowButton fullWidth variant="danger" onClick={handleStopAndSubmit} disabled={recordingDuration < 2}>
                    Stop &amp; Submit Sample {sampleNumber}
                  </GlowButton>
                  {recordingDuration < 2 && <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>Speak for at least 2 seconds</div>}
                </motion.div>
              )}

              {step === STEPS.PROCESSING && (
                <motion.div key="processing" style={{ ...sectionStyle, padding: "24px 0" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <motion.div style={{ width: 44, height: 44, border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1", borderRadius: "50%" }}
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  <div style={{ fontSize: "13.5px", color: "#64748b", textAlign: "center", fontWeight: 500 }}>Processing sample {sampleNumber}...</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>Extracting your voiceprint</div>
                </motion.div>
              )}

              {step === STEPS.SUCCESS && (
                <motion.div key="success" style={sectionStyle}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <motion.div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(34,197,94,0.3)" }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 18 }}>
                    <CheckIcon size={30} />
                  </motion.div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Voice Enrolled!</div>
                  <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>All 3 samples recorded. Your voiceprint is ready.</div>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                    {["3 samples averaged into 1 voiceprint", "Stored as encrypted embedding", "Original audio is never saved"].map((text, i) => (
                      <motion.div key={i} style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                        {text}
                      </motion.div>
                    ))}
                  </div>
                  <GlowButton fullWidth onClick={() => navigate("/login")}>Continue to Login</GlowButton>
                </motion.div>
              )}

              {step === STEPS.ERROR && (
                <motion.div key="error" style={sectionStyle}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                    <AlertIcon />
                  </div>
                  <div style={{ fontSize: 13, color: "#dc2626", textAlign: "center", lineHeight: 1.5 }}>{error}</div>
                  <GlowButton fullWidth onClick={async () => { setError(""); await fetchChallenge(); setStep(STEPS.CHALLENGE); }}>Try Again</GlowButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, fontSize: "11.5px", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <ShieldIcon />
            Voice data encrypted &middot; never stored as audio
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
