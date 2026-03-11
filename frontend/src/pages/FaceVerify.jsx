// frontend/src/pages/FaceVerify.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CameraCapture from "../components/CameraCapture";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import AnimatedBackground from "../components/AnimatedBackground";
import GlowButton from "../components/GlowButton";

// ── Icons ──────────────────────────────────────────────────────────────────────
const ScanIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const XCircleIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

// ── Scanning ring animation ───────────────────────────────────────────────────
const ScanningRing = () => (
  <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:10, borderRadius:"inherit", overflow:"hidden" }}>
    {/* Corner brackets */}
    {[
      { top:8, left:8, borderTop:"2px solid #6366f1", borderLeft:"2px solid #6366f1" },
      { top:8, right:8, borderTop:"2px solid #6366f1", borderRight:"2px solid #6366f1" },
      { bottom:8, left:8, borderBottom:"2px solid #6366f1", borderLeft:"2px solid #6366f1" },
      { bottom:8, right:8, borderBottom:"2px solid #6366f1", borderRight:"2px solid #6366f1" },
    ].map((s,i) => (
      <div key={i} style={{ position:"absolute", width:20, height:20, ...s, borderRadius:2 }}/>
    ))}
    {/* Scan line */}
    <motion.div
      style={{
        position:"absolute", left:0, right:0, height:2,
        background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.9),rgba(99,102,241,0.4),rgba(99,102,241,0.9),transparent)",
        boxShadow:"0 0 12px rgba(99,102,241,0.7)",
      }}
      animate={{ top:["5%","95%","5%"] }}
      transition={{ duration:2.4, repeat:Infinity, ease:"linear" }}
    />
  </div>
);

// ── Original component logic fully preserved ──────────────────────────────────
const STEPS = { IDLE:0, PROCESSING:1, SUCCESS:2, FAILURE:3 };

export default function FaceVerify() {
  const navigate  = useNavigate();
  // ✅ Original AuthContext usage
  const { token, verifyFaceSuccess } = useContext(AuthContext);
  const [step,    setStep]    = useState(STEPS.IDLE);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);
  // ✅ Original handleCapture logic preserved exactly
  const handleCapture = async (formData) => {
    setStep(STEPS.PROCESSING);
    try {
      const res  = await apiClient.post("/verification/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      setResult(data);
      if (data.data?.status === "SUCCESS") {
        verifyFaceSuccess();
        setStep(STEPS.SUCCESS);
      } else {
        setError(data.message || "Face not recognised. Please try again.");
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
          style={{ width:"100%", maxWidth:500 }}
          initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
        >
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <motion.div
              style={{
                width:56, height:56, borderRadius:16, margin:"0 auto 16px",
                background:"linear-gradient(135deg,#4338ca,#6366f1)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
                boxShadow:"0 8px 24px rgba(99,102,241,0.35)",
              }}
              animate={{ boxShadow:["0 8px 24px rgba(99,102,241,0.25)","0 8px 36px rgba(99,102,241,0.45)","0 8px 24px rgba(99,102,241,0.25)"] }}
              transition={{ duration:2.5, repeat:Infinity }}
            >
              <ScanIcon size={26}/>
            </motion.div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-0.5px", marginBottom:6 }}>Face Verification</h1>
            <p style={{ fontSize:13.5, color:"#64748b" }}>Position your face in the frame and capture</p>
          </div>

          <div style={{
            background:"#ffffff", border:"1px solid rgba(0,0,0,0.08)", borderRadius:20,
            padding:28, position:"relative", overflow:"hidden",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"20px 20px 0 0", background:"linear-gradient(90deg,#4338ca,#6366f1,#06b6d4)" }}/>

            <AnimatePresence mode="wait">
              {step === STEPS.IDLE && (
                <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <div style={{ position:"relative", borderRadius:12, overflow:"hidden" }}>
                    <CameraCapture onCapture={handleCapture} buttonLabel="Capture & Verify"/>
                  </div>
                  <div style={{
                    marginTop:16, padding:"11px 14px",
                    background:"#f0f4ff", border:"1px solid #c7d2fe",
                    borderRadius:10, fontSize:12, color:"#4338ca", lineHeight:1.5,
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                    <span style={{fontSize:15}}>💡</span>
                    Ensure good lighting. Look directly at the camera. Keep your face centred in frame.
                  </div>
                </motion.div>
              )}

              {step === STEPS.PROCESSING && (
                <motion.div key="proc" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                  style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ position:"relative", width:80, height:80, margin:"0 auto 24px" }}>
                    <motion.div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2.5px solid transparent", borderTopColor:"#6366f1", borderRightColor:"rgba(99,102,241,0.2)" }}
                      animate={{ rotate:360 }} transition={{ duration:0.85, repeat:Infinity, ease:"linear" }}/>
                    <motion.div style={{ position:"absolute", inset:10, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#06b6d4", borderRightColor:"rgba(6,182,212,0.2)" }}
                      animate={{ rotate:-360 }} transition={{ duration:1.3, repeat:Infinity, ease:"linear" }}/>
                    <div style={{ position:"absolute", inset:20, borderRadius:"50%", background:"#eef2ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>
                      <ScanIcon size={18}/>
                    </div>
                  </div>
                  <p style={{ fontSize:16, fontWeight:600, color:"#0f172a", marginBottom:6 }}>Analysing face…</p>
                  <p style={{ fontSize:13, color:"#64748b" }}>Running biometric verification</p>
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
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
                    <h2 style={{ fontSize:20, fontWeight:700, color:"#059669", marginBottom:8 }}>Identity Verified!</h2>
                    {result?.data?.similarityScore != null && (
                      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"8px 16px", marginBottom:20 }}>
                        <span style={{ fontSize:13, color:"#16a34a" }}>Confidence:</span>
                        <span style={{ fontSize:15, fontWeight:700, color:"#15803d" }}>{(result.data.similarityScore*100).toFixed(1)}%</span>
                      </div>
                    )}
                    <GlowButton variant="success" size="md" fullWidth onClick={() => navigate("/dashboard")}>
                      Continue to Dashboard →
                    </GlowButton>
                  </motion.div>
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
                    {error || result?.message || "Face not recognised. Please try again."}
                  </p>
                  <GlowButton variant="danger" size="md" fullWidth onClick={() => { setStep(STEPS.IDLE); setError(""); setResult(null); }}>
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