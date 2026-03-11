import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import GlowButton from "../components/GlowButton";

const FingerprintIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);
const CameraIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
);
const CheckIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const SunIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
const EyeIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const GlassesIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="14" r="4"/><circle cx="17" cy="14" r="4"/><path d="M3 14a4 4 0 0 1 4-4"/><path d="M13 14a4 4 0 0 1 4-4"/><path d="M11 14h2"/></svg>);
const UserIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SpinnerIcon = () => (
  <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
    animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </motion.svg>
);

const FaceOutline = ({ scanning, captured }) => (
  <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    {[
      { x: 60, y: 55, rotate: 0 }, { x: 260, y: 55, rotate: 90 },
      { x: 60, y: 325, rotate: 270 }, { x: 260, y: 325, rotate: 180 },
    ].map((c, i) => (
      <g key={i} transform={`rotate(${c.rotate}, ${c.x}, ${c.y})`}>
        <line x1={c.x - 16} y1={c.y} x2={c.x + 16} y2={c.y}
          stroke={captured ? "#22c55e" : scanning ? "#8b5cf6" : "rgba(255,255,255,0.35)"}
          strokeWidth="2.5" strokeLinecap="round" style={{ transition: "stroke 0.4s" }} />
        <line x1={c.x} y1={c.y - 16} x2={c.x} y2={c.y + 16}
          stroke={captured ? "#22c55e" : scanning ? "#8b5cf6" : "rgba(255,255,255,0.35)"}
          strokeWidth="2.5" strokeLinecap="round" style={{ transition: "stroke 0.4s" }} />
      </g>
    ))}
    <ellipse cx="160" cy="188" rx="88" ry="115"
      stroke={captured ? "#22c55e" : scanning ? "#8b5cf6" : "rgba(255,255,255,0.2)"}
      strokeWidth="1.5" strokeDasharray={scanning ? "6 4" : "none"} style={{ transition: "stroke 0.4s" }} />
    {scanning && !captured && (
      <motion.line x1="72" x2="248" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5"
        initial={{ y1: 73, y2: 73 }} animate={{ y1: [73, 303, 73], y2: [73, 303, 73] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} />
    )}
  </svg>
);

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

const Steps = ({ current }) => {
  const steps = ["Register", "Enroll Face", "Complete"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <motion.div
                style={{ width: 28, height: 28, borderRadius: "50%",
                  background: done ? "#22c55e" : active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f1f5f9",
                  border: active ? "none" : done ? "none" : "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center" }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "#94a3b8", fontFamily: "'Inter', sans-serif" }}>{i + 1}</span>}
              </motion.div>
              <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, color: active ? "#0f172a" : done ? "#22c55e" : "#94a3b8", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.div style={{ flex: 1, height: 1.5, background: done ? "#22c55e" : "#e2e8f0", margin: "0 6px", marginBottom: 18, transformOrigin: "left" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: "easeOut" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function FaceEnroll() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const progressRef = useRef(null);

  const [phase, setPhase] = useState("idle");
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [enrollError, setEnrollError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = async () => {
    setCameraError(null);
    setEnrollError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setPhase("active");
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions and try again.");
      setPhase("error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  const captureFace = () => {
    if (phase !== "active") return;
    setPhase("scanning");
    setScanProgress(0);
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(progressRef.current);
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          canvasRef.current.width = videoRef.current.videoWidth || 640;
          canvasRef.current.height = videoRef.current.videoHeight || 480;
          ctx.drawImage(videoRef.current, 0, 0);
          const imageDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.92);
          setCapturedImage(imageDataUrl);
          stopCamera();
          validateFacePresent(imageDataUrl);
        }
      }
    }, 30);
  };

  const validateFacePresent = async (imageDataUrl) => {
    setPhase("uploading");
    try {
      const fetchRes = await fetch(imageDataUrl);
      const blob = await fetchRes.blob();
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:8000/extract-embedding", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success && data.embedding) {
        setPhase("captured");
      } else {
        setCapturedImage(null);
        setScanProgress(0);
        setCameraError("No face detected. Please position your face inside the oval and try again.");
        setPhase("active");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }
    } catch (err) {
      console.error("Face validation error:", err);
      setPhase("captured");
    }
  };

  const retake = () => { setCapturedImage(null); setScanProgress(0); setEnrollError(null); setPhase("idle"); };

  const confirmEnroll = async () => {
    if (!capturedImage) return;
    setEnrollError(null);
    setPhase("uploading");
    try {
      const fetchRes = await fetch(capturedImage);
      const blob = await fetchRes.blob();
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/verification/register-face", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      console.log("Enroll response:", data);
      if (data.success) { setPhase("success"); }
      else { setEnrollError(data.message || "Enrollment failed. Please try again."); setPhase("captured"); }
    } catch (err) {
      console.error("Enroll network error:", err);
      setEnrollError("Network error. Please check your connection and try again.");
      setPhase("captured");
    }
  };

  useEffect(() => { return () => { stopCamera(); clearInterval(progressRef.current); }; }, []);

  const isScanning = phase === "scanning";
  const isCaptured = phase === "captured";
  const isActive = phase === "active";
  const isSuccess = phase === "success";
  const isIdle = phase === "idle";
  const isError = phase === "error";
  const isUploading = phase === "uploading";

  return (
    <div className="page-wrapper">
      <AnimatedBackground />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px 40px" }}>

        {/* Brand */}
        <motion.div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.08 }} whileHover={{ scale: 1.08, rotate: 5 }}>
            <FingerprintIcon />
          </motion.div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>VerifyAI</div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", fontFamily: "'Inter', sans-serif" }}>Face Enrollment</div>
          </div>
        </motion.div>

        <motion.div style={{ width: "100%", maxWidth: "500px" }}
          initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>

          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div key="success" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px", padding: "12px 0" }}
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <motion.div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(34,197,94,0.32)" }}
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 16 }}>
                    <CheckIcon size={34} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>Face Enrolled!</div>
                  </motion.div>
                  <motion.div style={{ fontSize: "14px", color: "#64748b", maxWidth: "300px", lineHeight: 1.6 }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    Your biometric profile has been created. Now set up your voiceprint to complete registration.
                  </motion.div>
                  <motion.div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", color: "#059669", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: "7px" }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Biometric hash stored &middot; 256-bit AES encrypted
                  </motion.div>
                  <motion.div style={{ width: "100%", marginTop: 6 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                    <GlowButton fullWidth onClick={() => navigate("/voice-enroll")}>Continue to Voice Enroll</GlowButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}><Steps current={1} /></motion.div>
                    <motion.div variants={itemVariants}>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginBottom: "5px" }}>Biometric Face Enrollment</div>
                      <div style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "28px" }}>Capture your face to secure your account</div>
                    </motion.div>

                    <AnimatePresence>
                      {isError && cameraError && (
                        <motion.div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" }}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          {cameraError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {enrollError && (
                        <motion.div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" }}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          {enrollError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Camera Viewport */}
                    <motion.div variants={itemVariants}
                      style={{ width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden", position: "relative", background: "#0a0a18", boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)", marginBottom: "20px" }}
                      whileHover={{ boxShadow: "0 6px 28px rgba(99,102,241,0.15), inset 0 0 0 1px rgba(99,102,241,0.15)" }}>
                      {(isIdle || isError) && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                          <motion.div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1.5px dashed rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)" }}
                            animate={{ scale: [1, 1.06, 1], borderColor: ["rgba(255,255,255,0.15)", "rgba(139,92,246,0.3)", "rgba(255,255,255,0.15)"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                            <CameraIcon size={32} />
                          </motion.div>
                          <motion.span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}
                            animate={{ opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 3, repeat: Infinity }}>
                            Camera preview will appear here
                          </motion.span>
                        </div>
                      )}
                      <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: (isActive || isScanning) ? "block" : "none" }} />
                      {(isCaptured || isUploading) && capturedImage && (
                        <motion.img src={capturedImage} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }}
                          initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} alt="Captured face" />
                      )}
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                      {(isActive || isScanning || isCaptured || isUploading) && <FaceOutline scanning={isScanning} captured={isCaptured || isUploading} />}

                      {isActive && <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", backdropFilter: "blur(12px)" }}>
                        <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />LIVE
                      </div>}
                      {isScanning && <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", backdropFilter: "blur(12px)" }}>
                        <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />SCANNING
                      </div>}
                      {isCaptured && <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", backdropFilter: "blur(12px)" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />CAPTURED
                      </div>}
                      {isUploading && <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", backdropFilter: "blur(12px)" }}>
                        <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />{capturedImage ? "CHECKING\u2026" : "UPLOADING"}
                      </div>}
                      {isScanning && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", width: `${scanProgress}%`, transition: "width 0.05s linear", borderRadius: "0 2px 2px 0" }} />
                        </div>
                      )}
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} style={{ display: "flex", gap: "10px", marginBottom: "22px" }}>
                      {!isCaptured && !isUploading ? (
                        <div style={{ flex: 1 }}>
                          <GlowButton fullWidth disabled={isScanning} onClick={isIdle || isError ? startCamera : captureFace}>
                            {isIdle || isError ? "Enable Camera" : isScanning ? `Scanning\u2026 ${scanProgress}%` : "Capture Face"}
                          </GlowButton>
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <GlowButton fullWidth disabled={isUploading} onClick={confirmEnroll}
                            icon={isUploading ? <SpinnerIcon /> : null}>
                            {isUploading ? "Enrolling\u2026" : "Confirm & Enroll"}
                          </GlowButton>
                        </div>
                      )}
                      {(isActive || isScanning || isCaptured) && (
                        <GlowButton variant="secondary" disabled={isScanning || isUploading} onClick={retake}>Retake</GlowButton>
                      )}
                    </motion.div>

                    {/* Instructions */}
                    <motion.div variants={itemVariants} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>Setup Guide</div>
                      {[
                        { icon: <SunIcon />, text: "Ensure bright, even lighting \u2014 avoid backlighting" },
                        { icon: <UserIcon />, text: "Center your face within the oval guide" },
                        { icon: <GlassesIcon />, text: "Remove glasses or face coverings if possible" },
                        { icon: <EyeIcon />, text: "Look directly at the camera and hold still" },
                      ].map((item, i) => (
                        <motion.div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", fontSize: "13px", color: "#475569", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.08 }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}>{item.icon}</div>
                          <span>{item.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px", fontSize: "11px", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Biometric data encrypted and securely stored
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
