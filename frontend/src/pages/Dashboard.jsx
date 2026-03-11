// frontend/src/pages/Dashboard.jsx
// ── REDESIGNED — preserves all existing API calls, AuthContext, localStorage ──

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import HoverCard from "../components/HoverCard";
import GlowButton from "../components/GlowButton";

// ── Icons ──────────────────────────────────────────────────────────────────────
const FaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, delay }) => (
  <motion.div
    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
    transition={{ delay, duration:0.5, ease:[0.22,1,0.36,1] }}
  >
    <HoverCard accentColor={accent} glow={`${accent}50`} style={{ padding:"22px 24px" }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"20px 20px 0 0",
        background:`linear-gradient(90deg,transparent,${accent},transparent)`, opacity:0.7,
      }}/>
      <div style={{ fontSize:28, fontWeight:800, color:accent, letterSpacing:"-1.5px", fontFamily:"'Inter',sans-serif", marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:12.5, fontWeight:600, color:"#475569", marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#94a3b8" }}>{sub}</div>}
    </HoverCard>
  </motion.div>
);

// ── Biometric card ─────────────────────────────────────────────────────────────
const BiometricCard = ({ icon, title, enrolled, lastVerified, accentColor, onEnroll, delay }) => (
  <motion.div
    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
    transition={{ delay, duration:0.5, ease:[0.22,1,0.36,1] }}
    style={{ flex:1, minWidth:0 }}
  >
    <HoverCard accentColor={accentColor} glow={`${accentColor}40`} style={{ padding:"22px 24px", height:"100%" }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"20px 20px 0 0",
        background:enrolled ? `linear-gradient(90deg,transparent,${accentColor},transparent)` : "#f1f5f9",
      }}/>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{
          width:40, height:40, borderRadius:11,
          background:`${accentColor}18`, border:`1px solid ${accentColor}30`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:accentColor, boxShadow:`0 4px 16px ${accentColor}25`,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{title}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
            <motion.div
              style={{ width:7, height:7, borderRadius:"50%", background: enrolled ? "#22c55e" : "#f59e0b" }}
              animate={enrolled ? { scale:[1,1.4,1] } : {}}
              transition={{ duration:1.5, repeat:Infinity }}
            />
            <span style={{ fontSize:11.5, color: enrolled ? "#059669" : "#f59e0b", fontWeight:600 }}>
              {enrolled ? "Enrolled" : "Not enrolled"}
            </span>
          </div>
        </div>
      </div>
      {enrolled ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { label:"Status",       val:"Active",      color:"#22c55e" },
            { label:"Last verified",val:lastVerified,  color:"#475569" },
            { label:"Protection",   val:"Encrypted",   color:"#475569" },
          ].map((row,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:"#94a3b8" }}>{row.label}</span>
              <span style={{ color:row.color, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                {row.label==="Status" && <CheckIcon/>}
                {row.label==="Protection" && <ShieldIcon/>}
                {row.val}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ fontSize:12, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}>
            <AlertIcon/> Not set up yet
          </div>
          <GlowButton variant="primary" size="sm" fullWidth onClick={onEnroll}
            style={{ background:`linear-gradient(135deg,${accentColor}cc,${accentColor})`, boxShadow:`0 4px 16px ${accentColor}40` }}>
            Set up now →
          </GlowButton>
        </div>
      )}
    </HoverCard>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  // ✅ All original AuthContext + localStorage usage preserved
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const faceEnrolled  = !!localStorage.getItem("face_enrolled");
  const voiceEnrolled = !!localStorage.getItem("voice_enrolled");

  // ✅ All original API calls preserved
  const [stats,    setStats]    = useState({ total:"—", successRate:"—", securityLevel:"—" });
  const [history,  setHistory]  = useState([]);
  const [mlOnline, setMlOnline] = useState(null);

  useEffect(() => {
    apiClient.get("/verification/history")
      .then(res => {
        const logs  = res.data.data || [];
        const total = logs.length;
        const succ  = logs.filter(l => l.status === "SUCCESS").length;
        const rate  = total > 0 ? Math.round((succ/total)*100) : 0;
        setHistory(logs);
        setStats({
          total: total.toString(),
          successRate: total > 0 ? `${rate}%` : "N/A",
          securityLevel: faceEnrolled && voiceEnrolled ? "High" : faceEnrolled || voiceEnrolled ? "Partial" : "Low",
        });
      })
      .catch(() => {});

    apiClient.get("/ml-health")
      .then(res => setMlOnline(res.data.online))
      .catch(() => setMlOnline(false));
  }, [faceEnrolled, voiceEnrolled]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const securityPct = faceEnrolled && voiceEnrolled ? 100 : faceEnrolled || voiceEnrolled ? 60 : 20;

  return (
    <>
      <AnimatedBackground />

      {/* ML offline banner */}
      <AnimatePresence>
        {mlOnline === false && (
          <motion.div
            initial={{ y:-40 }} animate={{ y:0 }} exit={{ y:-40 }}
            style={{
              position:"fixed", top:0, left:0, right:0, zIndex:300,
              background:"#fef2f2", borderBottom:"1px solid #fecaca",
              padding:"10px 24px", textAlign:"center",
              fontSize:13, color:"#dc2626", fontWeight:500,
            }}
          >
            ⚠️ ML service is offline — biometric verification is unavailable right now.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <div style={{
        position:"fixed", top: mlOnline === false ? 42 : 0, left:0, right:0, zIndex:200,
        height:64, display:"flex", alignItems:"center", padding:"0 clamp(16px,3vw,40px)",
        background:"rgba(255,255,255,0.9)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth:1100, width:"100%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:9,
              background:"linear-gradient(135deg,#4338ca,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
              boxShadow:"0 3px 12px rgba(99,102,241,0.45)",
            }}>
              <ShieldIcon/>
            </div>
            <span style={{ fontSize:15, fontWeight:800, color:"#0f172a", letterSpacing:"-0.2px" }}>VerifyAI</span>
            <div className="vai-badge vai-badge-indigo" style={{ fontSize:9.5 }}>Dashboard</div>
          </div>
          <GlowButton variant="ghost" size="sm" icon={<LogoutIcon/>} onClick={handleLogout}>
            Sign out
          </GlowButton>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth:1100, margin:"0 auto",
        padding:`${mlOnline === false ? 128 : 96}px 20px 60px`,
        position:"relative", zIndex:1,
      }}>
        {/* Greeting */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
          style={{ marginBottom:32 }}
        >
          <h1 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:800, color:"#0f172a", letterSpacing:"-0.8px", marginBottom:4 }}>
            Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p style={{ fontSize:14, color:"#64748b" }}>Your biometric security dashboard</p>
        </motion.div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
          <StatCard label="Total Verifications" value={stats.total}        sub="All time"           accent="#6366f1" delay={0.05}/>
          <StatCard label="Success Rate"        value={stats.successRate}  sub="Based on your logs" accent="#22c55e" delay={0.10}/>
          <StatCard label="Security Level"      value={stats.securityLevel} sub="2 factors active"  accent="#f59e0b" delay={0.15}/>
          <StatCard label="ML Service"
            value={mlOnline === null ? "..." : mlOnline ? "Online" : "Offline"}
            sub="Biometric engine"
            accent={mlOnline ? "#22c55e" : mlOnline === null ? "#f59e0b" : "#ef4444"}
            delay={0.20}
          />
        </div>

        {/* Biometric status */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.25, duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ marginBottom:8 }}
        >
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase", fontFamily:"'Inter',sans-serif", marginBottom:12 }}>
            Biometric Security
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <BiometricCard
              icon={<FaceIcon/>} title="Face Biometric"
              enrolled={faceEnrolled} lastVerified="See history"
              accentColor="#6366f1" delay={0.28}
              onEnroll={() => navigate("/register-face")}
            />
            <BiometricCard
              icon={<MicIcon/>} title="Voice Biometric"
              enrolled={voiceEnrolled} lastVerified="See history"
              accentColor="#06b6d4" delay={0.33}
              onEnroll={() => navigate("/voice-enroll")}
            />
          </div>
        </motion.div>

        {/* Re-enroll */}
        {(faceEnrolled || voiceEnrolled) && (
          <div style={{ display:"flex", gap:10, marginTop:12, marginBottom:24 }}>
            {faceEnrolled && (
              <GlowButton variant="ghost" size="sm" onClick={() => navigate("/register-face")}>
                🔄 Re-enroll Face
              </GlowButton>
            )}
            {voiceEnrolled && (
              <GlowButton variant="ghost" size="sm" onClick={() => navigate("/voice-enroll")}>
                🔄 Re-enroll Voice
              </GlowButton>
            )}
          </div>
        )}

        {/* Security strength bar */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.35, duration:0.5 }}
          style={{ marginBottom:24 }}
        >
          <GlassCard hover={false} padding="20px 24px">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#475569" }}>Account Security Strength</span>
              <span style={{ fontSize:13, fontWeight:700, color: securityPct===100 ? "#22c55e" : "#f59e0b" }}>
                {securityPct===100 ? "Maximum" : securityPct===60 ? "Partial" : "Minimal"}
              </span>
            </div>
            <div style={{ height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden", marginBottom:12 }}>
              <motion.div
                style={{ height:"100%", borderRadius:3, background: securityPct===100 ? "linear-gradient(90deg,#4338ca,#22c55e)" : "linear-gradient(90deg,#f59e0b,#fbbf24)" }}
                initial={{ width:0 }}
                animate={{ width:`${securityPct}%` }}
                transition={{ delay:0.5, duration:1, ease:"easeOut" }}
              />
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[{label:"Password",done:true},{label:"Face",done:faceEnrolled},{label:"Voice",done:voiceEnrolled}].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                  <div style={{
                    width:16, height:16, borderRadius:"50%",
                    background: item.done ? "#22c55e" : "#f1f5f9",
                    border: item.done ? "none" : "1px solid #e2e8f0",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow: item.done ? "0 0 8px rgba(34,197,94,0.4)" : "none",
                  }}>
                    {item.done && <CheckIcon/>}
                  </div>
                  <span style={{ color: item.done ? "#475569" : "#94a3b8" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* ✅ Live verification history — original API preserved */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.4, duration:0.5 }}
        >
          <GlassCard hover={false} padding="22px 24px">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
              <div style={{
                width:28, height:28, borderRadius:8,
                background:"#eef2ff", border:"1px solid #c7d2fe",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1",
              }}>
                <ActivityIcon/>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Recent Activity</span>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", padding:"24px 0" }}>
                No verification history yet.
              </p>
            ) : (
              history.slice(0,8).map((log,i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.5+i*0.05, duration:0.35 }}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"11px 0",
                    borderBottom: i < Math.min(history.length,8)-1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <motion.div
                      style={{
                        width:9, height:9, borderRadius:"50%",
                        background: log.status==="SUCCESS" ? "#22c55e" : "#ef4444",
                        boxShadow: log.status==="SUCCESS" ? "0 0 8px rgba(34,197,94,0.5)" : "0 0 8px rgba(239,68,68,0.5)",
                      }}
                      animate={{ scale:[1,1.3,1] }} transition={{ duration:2, repeat:Infinity, delay:i*0.1 }}
                    />
                    <span style={{ fontSize:13, color:"#475569" }}>
                      Verification —{" "}
                      <span style={{ fontWeight:600, color: log.status==="SUCCESS" ? "#059669" : "#dc2626" }}>
                        {log.status}
                      </span>
                    </span>
                    {log.similarity_score != null && (
                      <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"'Inter',sans-serif" }}>
                        ({Math.round(log.similarity_score*100)}% match)
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"'Inter',sans-serif" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </motion.div>
              ))
            )}
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
}