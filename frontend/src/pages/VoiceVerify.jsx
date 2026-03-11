// frontend/src/pages/VoiceVerify.jsx
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WaveformVisualizer from "../components/WaveformVisualizer";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import AnimatedBackground from "../components/AnimatedBackground";
import GlowButton from "../components/GlowButton";

// ── Icons ──────────────────────────────────────────────────────────────────────
const MicIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const XCircleIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);

// ── Original step constants ───────────────────────────────────────────────────
const STEPS = { LOADING:0, READY:1, RECORDING:2, PROCESSING:3, SUCCESS:4, FAILURE:5 };

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VoiceVerify() {
  const navigate  = useNavigate();
  // ✅ Original AuthContext usage
  const { token, verifyVoiceSuccess } = useContext(AuthContext);

  const [step,     setStep]     = useState(STEPS.LOADING);
  const [phrase,   setPhrase]   = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [isRecording, setIsRecording]   = useState(false);
  const [duration, setDuration] = useState(0);
  const [error,    setError]    = useState("");
  const [result,   setResult]   = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);

  // ✅ Original useEffect logic preserved
  useEffect(() => {
    apiClient.get("/voice/challenge")
      .then(res => {
        setPhrase(res.data.phrase);
        setSessionToken(res.data.session_token);
        setStep(STEPS.READY);
      })
      .catch(() => {
        setError("Failed to fetch voice challenge. Please refresh.");
        setStep(STEPS.FAILURE);
      });
  }, []);

  // ✅ Original recording logic preserved
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const mr = new MediaRecorder(stream, { mimeType:"audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(p => p+1), 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
      setStep(STEPS.FAILURE);
    }
  };

  const stopAndVerify = () => {
    return new Promise(resolve => {
      const mr = mediaRecorderRef.current;
      if (!mr) return resolve(null);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:"audio/webm" });
        mr.stream.getTracks().forEach(t => t.stop());
        resolve(blob);
      };
      mr.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    });
  };

  // ✅ Original handleStop logic preserved
  const handleStop = async () => {
    const blob = await stopAndVerify();
    if (!blob) { setError("No audio recorded."); setStep(STEPS.FAILURE); return; }
    setStep(STEPS.PROCESSING);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("session_token", sessionToken);
      const res  = await apiClient.post("/voice/verify", formData, { headers:{ "Content-Type":"multipart/form-data" } });
      const data = res.data;
      setResult(data);
      if (data.match) {
        verifyVoiceSuccess?.();
        setStep(STEPS.SUCCESS);
      } else {
        setError(data.message || "Voice not recognised. Please try again.");
        setStep(STEPS.FAILURE);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Verification failed. Please try again.");
      setStep(STEPS.FAILURE);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <motion.div
        style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", zIndex:1 }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
      >
        <motion.div
          style={{ width:"100%", maxWidth:480 }}
          initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
        >
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <motion.div
              style={{
                width:56, height:56, borderRadius:16, margin:"0 auto 16px",
                background:"linear-gradient(135deg,#0891b2,#06b6d4)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
                boxShadow: isRecording ? "0 8px 28px rgba(239,68,68,0.40)" : "0 8px 24px rgba(6,182,212,0.35)",
              }}
              animate={{ boxShadow: isRecording
                ? ["0 8px 24px rgba(239,68,68,0.30)","0 8px 36px rgba(239,68,68,0.50)","0 8px 24px rgba(239,68,68,0.30)"]
                : ["0 8px 24px rgba(6,182,212,0.25)","0 8px 36px rgba(6,182,212,0.45)","0 8px 24px rgba(6,182,212,0.25)"]
              }}
              transition={{ duration:1.5, repeat:Infinity }}
            >
              <MicIcon size={26}/>
            </motion.div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-0.5px", marginBottom:6 }}>Voice Verification</h1>
            <p style={{ fontSize:13.5, color:"#64748b" }}>Read the phrase aloud to verify your identity</p>
          </div>

          <div style={{
            background:"#ffffff", border:"1px solid rgba(0,0,0,0.08)", borderRadius:20,
            padding:28, position:"relative", overflow:"hidden",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"20px 20px 0 0", background:"linear-gradient(90deg,#06b6d4,#0891b2,#6366f1)" }}/>

            <AnimatePresence mode="wait">
              {step === STEPS.LOADING && (
                <motion.div key="load" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  style={{ textAlign:"center", padding:"40px 0" }}>
                  <div className="vai-spinner" style={{ margin:"0 auto 16px" }}/>
                  <p style={{ color:"#64748b", fontSize:14 }}>Loading voice challenge…</p>
                </motion.div>
              )}

              {step === STEPS.READY && (
                <motion.div key="ready" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
                    Read this phrase aloud
                  </p>
                  <div style={{
                    background:"#ecfeff", border:"1px solid #a5f3fc",
                    borderRadius:14, padding:"18px 22px", marginBottom:20, textAlign:"center",
                  }}>
                    <p style={{ fontSize:18, fontWeight:700, color:"#0e7490", fontStyle:"italic", lineHeight:1.4 }}>
                      "{phrase}"
                    </p>
                  </div>
                  <div className="vai-waveform-wrap" style={{ marginBottom:20 }}>
                    <WaveformVisualizer isRecording={false} color="#06b6d4" height={60}/>
                  </div>
                  <GlowButton variant="primary" size="lg" fullWidth
                    style={{ background:"linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow:"0 4px 16px rgba(6,182,212,0.30)" }}
                    icon={<MicIcon size={16}/>}
                    onClick={() => { setStep(STEPS.RECORDING); startRecording(); }}
                  >
                    Start Recording
                  </GlowButton>
                </motion.div>
              )}

              {step === STEPS.RECORDING && (
                <motion.div key="rec" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14 }}>
                    <motion.div style={{ width:10, height:10, borderRadius:"50%", background:"#ef4444" }}
                      animate={{ scale:[1,1.5,1], opacity:[1,0.5,1] }} transition={{ duration:0.8, repeat:Infinity }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:"#dc2626" }}>Recording…</span>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>{duration}s</span>
                  </div>
                  <div style={{ background:"#ecfeff", border:"1px solid #a5f3fc", borderRadius:14, padding:"14px 20px", marginBottom:18, textAlign:"center" }}>
                    <p style={{ fontSize:16, fontWeight:700, color:"#0e7490", fontStyle:"italic" }}>"{phrase}"</p>
                  </div>
                  <div className="vai-waveform-wrap" style={{ marginBottom:18 }}>
                    <WaveformVisualizer isRecording={isRecording} color="#06b6d4" height={80}/>
                  </div>
                  <GlowButton variant="danger" size="lg" fullWidth disabled={duration < 2} icon={<StopIcon/>} onClick={handleStop}>
                    {duration < 2 ? `Speak for ${2-duration}s more…` : "Stop & Verify"}
                  </GlowButton>
                </motion.div>
              )}

              {step === STEPS.PROCESSING && (
                <motion.div key="proc" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                  style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ position:"relative", width:80, height:80, margin:"0 auto 24px" }}>
                    <motion.div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2.5px solid transparent", borderTopColor:"#06b6d4", borderRightColor:"rgba(6,182,212,0.2)" }}
                      animate={{ rotate:360 }} transition={{ duration:0.85, repeat:Infinity, ease:"linear" }}/>
                    <motion.div style={{ position:"absolute", inset:10, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#6366f1", borderRightColor:"rgba(99,102,241,0.2)" }}
                      animate={{ rotate:-360 }} transition={{ duration:1.3, repeat:Infinity, ease:"linear" }}/>
                    <div style={{ position:"absolute", inset:20, borderRadius:"50%", background:"#ecfeff", display:"flex", alignItems:"center", justifyContent:"center", color:"#0e7490" }}>
                      <MicIcon size={18}/>
                    </div>
                  </div>
                  <p style={{ fontSize:16, fontWeight:600, color:"#0f172a", marginBottom:6 }}>Analysing voiceprint…</p>
                  <p style={{ fontSize:13, color:"#64748b" }}>Running speaker verification</p>
                </motion.div>
              )}

              {step === STEPS.SUCCESS && (
                <motion.div key="success" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                  style={{ textAlign:"center", padding:"40px 24px" }}>
                  <motion.div style={{ color:"#059669", marginBottom:16 }}
                    initial={{ scale:0 }} animate={{ scale:1 }}
                    transition={{ type:"spring", stiffness:200, damping:14, delay:0.1 }}>
                    <CheckCircleIcon/>
                  </motion.div>
                  <h2 style={{ fontSize:20, fontWeight:700, color:"#059669", marginBottom:8 }}>Voice Verified!</h2>
                  {result?.confidence != null && (
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"8px 16px", marginBottom:20 }}>
                      <span style={{ fontSize:13, color:"#16a34a" }}>Match confidence:</span>
                      <span style={{ fontSize:15, fontWeight:700, color:"#15803d" }}>{(result.confidence*100).toFixed(1)}%</span>
                    </div>
                  )}
                  <GlowButton variant="success" size="md" fullWidth onClick={() => navigate("/dashboard")}>
                    Continue to Dashboard →
                  </GlowButton>
                </motion.div>
              )}

              {step === STEPS.FAILURE && (
                <motion.div key="fail" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                  style={{ textAlign:"center", padding:"40px 24px" }}>
                  <motion.div style={{ color:"#dc2626", marginBottom:16 }}
                    initial={{ scale:0 }} animate={{ scale:1, x:[0,-8,8,-6,6,-3,0] }}
                    transition={{ scale:{ type:"spring", stiffness:200, damping:14 }, x:{ delay:0.1, duration:0.5 } }}>
                    <XCircleIcon/>
                  </motion.div>
                  <h2 style={{ fontSize:20, fontWeight:700, color:"#dc2626", marginBottom:8 }}>Verification Failed</h2>
                  <p style={{ fontSize:13.5, color:"#64748b", marginBottom:24, lineHeight:1.5 }}>
                    {error || result?.message || "Voice not recognised. Please try again."}
                  </p>
                  <GlowButton variant="danger" size="md" fullWidth
                    onClick={() => {
                      setStep(STEPS.READY); setError(""); setResult(null);
                      apiClient.get("/voice/challenge").then(res => {
                        setPhrase(res.data.phrase);
                        setSessionToken(res.data.session_token);
                      });
                    }}>
                    Try Again
                  </GlowButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
