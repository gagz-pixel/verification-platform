import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, AnimatePresence } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import HoverCard from "../components/HoverCard";
import GlowButton from "../components/GlowButton";

// ── Icons ──────────────────────────────────────────────────────────────────────
const FingerprintIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);
const ScanFaceIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="11" r="3"/><path d="M12 4v1m0 12v1M4 12h1m14 0h1"/>
  </svg>
);
const MicIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ShieldIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const ZapIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const ArrowIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Animated reveal wrapper ───────────────────────────────────────────────────
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ── Biometric face illustration ───────────────────────────────────────────────
const BiometricHero = () => {
  const pts = [
    [96,74],[144,74],[80,96],[160,96],[120,100],
    [90,120],[150,120],[120,142],[100,164],[120,172],[140,164],[120,195],
    [76,148],[164,148],
  ];
  return (
    <div style={{ position:"relative", width:280, height:320, margin:"0 auto" }}>
      {/* outer ring glow */}
      <motion.div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:260, height:300, borderRadius:"50%",
        border:"1px solid rgba(99,102,241,0.3)",
        boxShadow:"0 0 60px rgba(99,102,241,0.15), inset 0 0 60px rgba(99,102,241,0.05)",
      }}
        animate={{ scale:[1,1.04,1], opacity:[0.5,1,0.5] }}
        transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
      />
      <motion.div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:220, height:260, borderRadius:"50%",
        border:"1px solid rgba(99,102,241,0.15)",
      }}
        animate={{ scale:[1.04,1,1.04], opacity:[0.3,0.7,0.3] }}
        transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut", delay:0.4 }}
      />
      <svg viewBox="0 0 240 280" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        {/* corner brackets */}
        {[[[28,28],[60,28],[28,28],[28,60]],[[212,28],[180,28],[212,28],[212,60]],
          [[28,252],[60,252],[28,252],[28,220]],[[212,252],[180,252],[212,252],[212,220]]
        ].map(([[x1,y1],[x2,y2],[x3,y3],[x4,y4]],i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
          </g>
        ))}
        {/* face ellipse */}
        <ellipse cx="120" cy="140" rx="78" ry="96"
          stroke="rgba(99,102,241,0.30)" strokeWidth="1.2" fill="none" strokeDasharray="5 4"/>
        {/* scan line */}
        <motion.line x1="40" x2="200"
          stroke="url(#scanGrad)" strokeWidth="1.5"
          initial={{ y1:44, y2:44 }}
          animate={{ y1:[44,236,44], y2:[44,236,44] }}
          transition={{ duration:2.8, repeat:Infinity, ease:"linear" }}
        />
        <defs>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="50%" stopColor="rgba(99,102,241,0.9)"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        {/* landmark dots */}
        {pts.map(([cx,cy],i) => (
          <motion.circle key={i} cx={cx} cy={cy} r="2.5" fill="#6366f1"
            initial={{ opacity:0, scale:0 }}
            animate={{ opacity:[0.3,1,0.3], scale:[0.7,1.2,0.7] }}
            transition={{ delay:i*0.1, duration:1.8, repeat:Infinity, repeatDelay:0.5 }}
          />
        ))}
        {/* connection lines */}
        {[[0,1],[2,3],[5,6],[8,9],[9,10],[7,11]].map(([a,b],i) => (
          <motion.line key={i}
            x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
            stroke="rgba(99,102,241,0.35)" strokeWidth="0.8"
            animate={{ opacity:[0.1,0.6,0.1] }}
            transition={{ delay:i*0.2, duration:2.2, repeat:Infinity }}
          />
        ))}
      </svg>
    </div>
  );
};

// ── Live status card ──────────────────────────────────────────────────────────
const LiveCard = () => (
  <motion.div
    initial={{ opacity:0, y:14 }}
    animate={{ opacity:1, y:0 }}
    transition={{ delay:0.8, duration:0.5 }}
    style={{
      background:"#ffffff",
      border:"1px solid rgba(0,0,0,0.08)",
      borderRadius:18, padding:"18px 22px",
      width:264, margin:"0 auto",
      boxShadow:"0 8px 40px rgba(0,0,0,0.08), 0 0 30px rgba(99,102,241,0.08)",
    }}
  >
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <div style={{
        width:34, height:34, borderRadius:10,
        background:"linear-gradient(135deg,#4338ca,#6366f1)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", flexShrink:0, boxShadow:"0 4px 14px rgba(99,102,241,0.45)",
      }}>
        <FingerprintIcon size={17}/>
      </div>
      <div>
        <div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a" }}>Identity Verified</div>
        <div style={{ fontSize:10.5, color:"#64748b", fontFamily:"'Inter',sans-serif" }}>· Biometric Auth</div>
      </div>
      <motion.div style={{
        marginLeft:"auto", width:8, height:8, borderRadius:"50%",
        background:"#22c55e", boxShadow:"0 0 0 3px rgba(34,197,94,0.2)",
      }}
        animate={{ scale:[1,1.5,1] }} transition={{ duration:1.5, repeat:Infinity }}
      />
    </div>
    {[
      { label:"Face Match", val:98, color:"#22c55e" },
      { label:"Liveness",   val:96, color:"#6366f1" },
      { label:"Confidence", val:99, color:"#06b6d4" },
    ].map((r,i) => (
      <div key={i} style={{ marginBottom: i<2 ? 9 : 0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:10.5, color:"#64748b", fontFamily:"'Inter',sans-serif" }}>{r.label}</span>
          <span style={{ fontSize:10.5, fontWeight:700, color:r.color, fontFamily:"'Inter',sans-serif" }}>{r.val}%</span>
        </div>
        <div style={{ height:4, borderRadius:2, background:"#f1f5f9", overflow:"hidden" }}>
          <motion.div style={{ height:"100%", borderRadius:2, background:r.color }}
            initial={{ width:0 }}
            animate={{ width:`${r.val}%` }}
            transition={{ delay:1+i*0.15, duration:1, ease:"easeOut" }}
          />
        </div>
      </div>
    ))}
  </motion.div>
);

// ── Feature hover cards data ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <ScanFaceIcon size={28}/>,
    title: "Face Verification",
    desc: "AI-powered facial biometrics with 99.7% accuracy. Sub-second real-time verification.",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.4)",
  },
  {
    icon: <MicIcon size={28}/>,
    title: "Voice Authentication",
    desc: "Voiceprint identification from 3 samples. Works in noisy environments.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.4)",
  },
  {
    icon: <ShieldIcon size={28}/>,
    title: "Secure Access",
    desc: "AES-256 encrypted embeddings. Zero raw image storage. SOC 2 compliant.",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.35)",
  },
  {
    icon: <ZapIcon size={28}/>,
    title: "Real-time AI",
    desc: "Dual-factor biometric challenge on every login. Smart fraud detection built in.",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
  },
];

const STATS = [
  { val:"99.7%",  label:"Match Accuracy" },
  { val:"<800ms", label:"Verify Latency" },
  { val:"256-bit",label:"Encryption" },
  { val:"0",      label:"Images Stored" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", v => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  return (
    <>
      <style>{`
        .vai-nav {
          position:fixed; top:0; left:0; right:0; z-index:200;
          height:64px; display:flex; align-items:center;
          padding:0 clamp(16px,4vw,52px);
          transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
          border-bottom: 1px solid transparent;
        }
        .vai-nav.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-color: rgba(0,0,0,0.08);
        }
        .vai-nav-inner {
          width:100%; max-width:1140px; margin:0 auto;
          display:flex; align-items:center; justify-content:space-between;
        }
        .vai-brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .vai-brand-icon {
          width:36px; height:36px; border-radius:10px;
          background:linear-gradient(135deg,#4338ca,#6366f1);
          display:flex; align-items:center; justify-content:center; color:#fff;
          box-shadow:0 4px 16px rgba(99,102,241,0.45);
        }
        .vai-brand-name { font-size:16px; font-weight:800; color:#0f172a; letter-spacing:-0.3px; }
        .vai-brand-tag {
          font-size:9px; font-weight:700; color:#6366f1;
          background:#eef2ff; border:1px solid #c7d2fe;
          padding:2px 8px; border-radius:4px; font-family:'Inter',sans-serif;
          letter-spacing:.5px; text-transform:uppercase;
        }
        .vai-nav-links { display:flex; align-items:center; gap:28px; }
        .vai-nav-link {
          font-size:14px; font-weight:500; color:#64748b;
          background:none; border:none; cursor:pointer;
          font-family:'Inter',sans-serif;
          transition:color 0.18s;
        }
        .vai-nav-link:hover { color:#0f172a; }
        .vai-nav-actions { display:flex; align-items:center; gap:10px; }
        .hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; flex-direction:column; gap:5px; }
        .hamburger span { width:22px; height:2px; background:#64748b; border-radius:2px; display:block; }
        @media (max-width:768px) {
          .vai-nav-links, .vai-nav-actions { display:none; }
          .hamburger { display:flex; }
        }
        .mobile-menu {
          position:fixed; top:64px; left:0; right:0; z-index:190;
          background:rgba(255,255,255,0.98); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(0,0,0,0.08);
          padding:20px 24px 28px;
          display:flex; flex-direction:column; gap:4px;
        }
        .mobile-link {
          padding:12px 0; font-size:15px; font-weight:500; color:#475569;
          border-bottom:1px solid #f1f5f9; cursor:pointer;
          background:none; border:none; text-align:left; font-family:'Inter',sans-serif;
        }
        .hero-section {
          min-height:100vh; padding:100px clamp(16px,4vw,52px) 80px;
          position:relative; display:flex; align-items:center;
        }
        .hero-inner {
          max-width:1140px; margin:0 auto; width:100%;
          display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center;
        }
        @media (max-width:900px) {
          .hero-inner { grid-template-columns:1fr; gap:56px; }
          .hero-right { order:-1; }
        }
        .section-wrap { padding:96px clamp(16px,4vw,52px); position:relative; }
        .section-inner { max-width:1140px; margin:0 auto; }
        .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px; }
        @media (max-width:600px) { .features-grid { grid-template-columns:1fr; } }
        .stats-strip {
          display:flex; flex-wrap:wrap; justify-content:center;
          border-top:1px solid #e2e8f0;
          border-bottom:1px solid #e2e8f0;
          padding:0 clamp(16px,4vw,52px);
        }
        .stat-item {
          flex:1; min-width:140px; padding:28px 20px; text-align:center;
          border-right:1px solid #e2e8f0;
        }
        .stat-item:last-child { border-right:none; }
        footer { padding:64px clamp(16px,4vw,52px) 32px; border-top:1px solid #e2e8f0; }
        .footer-inner { max-width:1140px; margin:0 auto; display:flex; justify-content:space-between; flex-wrap:wrap; gap:40px; align-items:flex-start; }
        @media (max-width:640px) { .footer-inner { flex-direction:column; } }
      `}</style>

      <AnimatedBackground />

      {/* ── Navbar ── */}
      <nav className={`vai-nav${scrolled ? " scrolled" : ""}`}>
        <div className="vai-nav-inner">
          <div className="vai-brand" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
            <div className="vai-brand-icon"><FingerprintIcon size={18}/></div>
            <span className="vai-brand-name">VerifyAI</span>
            <span className="vai-brand-tag">VaaS</span>
          </div>
          <div className="vai-nav-links">
            {["Features","Security","Docs"].map(l => (
              <button key={l} className="vai-nav-link"
                onClick={() => document.getElementById(l.toLowerCase())?.scrollIntoView({behavior:"smooth"})}>
                {l}
              </button>
            ))}
          </div>
          <div className="vai-nav-actions">
            <GlowButton variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</GlowButton>
            <GlowButton variant="primary" size="sm" onClick={() => navigate("/register")}>Get Started</GlowButton>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(v=>!v)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu"
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }} transition={{ duration:0.22 }}>
            {["Features","Security","Docs"].map(l => (
              <button key={l} className="mobile-link"
                onClick={() => { setMenuOpen(false); document.getElementById(l.toLowerCase())?.scrollIntoView({behavior:"smooth"}); }}>
                {l}
              </button>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <GlowButton variant="secondary" fullWidth onClick={() => navigate("/login")}>Login</GlowButton>
              <GlowButton variant="primary"   fullWidth onClick={() => navigate("/register")}>Get Started</GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner" style={{ position:"relative", zIndex:1 }}>
          {/* Left */}
          <div>
            {/* Live badge */}
            <motion.div
              initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5 }}
              style={{ marginBottom:24 }}
            >
              <div className="vai-badge vai-badge-indigo" style={{ fontSize:11, padding:"5px 14px" }}>
                <motion.div
                  style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 0 2px rgba(34,197,94,0.3)" }}
                  animate={{ scale:[1,1.6,1] }} transition={{ duration:1.5, repeat:Infinity }}
                />
                Biometric Identity Platform — Live
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.1, duration:0.65, ease:[0.22,1,0.36,1] }}
              style={{
                fontSize:"clamp(36px,5.5vw,66px)", fontWeight:800,
                color:"#0f172a", letterSpacing:"-2.5px",
                lineHeight:1.07, marginBottom:20,
              }}
            >
              Verify Identity
              <br/>
              <span style={{
                background:"linear-gradient(135deg,#a5b4fc,#6366f1,#06b6d4)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                With Your Face
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.2, duration:0.55 }}
              style={{ fontSize:"clamp(14px,1.8vw,18px)", color:"#64748b", lineHeight:1.7, marginBottom:36, maxWidth:480 }}
            >
              Next-generation authentication using AI-powered facial biometrics and voice recognition.
              Bank-grade identity verification in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.3, duration:0.5 }}
              style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40 }}
            >
              <GlowButton variant="primary" size="lg" icon={<ArrowIcon size={16}/>} onClick={() => navigate("/register")}>
                Start Free
              </GlowButton>
              <GlowButton variant="secondary" size="lg" onClick={() => navigate("/login")}>
                Sign In
              </GlowButton>
            </motion.div>

            {/* Trust proof */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:0.55, duration:0.5 }}
              style={{ display:"flex", gap:20, flexWrap:"wrap" }}
            >
              {["99.7% accuracy","<800ms verify","SOC 2 compliant"].map((p,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color:"#64748b", fontWeight:500 }}>
                  <span style={{ color:"#22c55e" }}><CheckIcon size={12}/></span>
                  {p}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <motion.div className="hero-right"
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.25, duration:0.65, ease:[0.22,1,0.36,1] }}
          >
            <div style={{ position:"relative" }}>
              {/* glow behind */}
              <div style={{
                position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                width:360, height:360, borderRadius:"50%",
                background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",
                filter:"blur(40px)", pointerEvents:"none",
              }}/>
              <motion.div animate={{ y:[0,-12,0] }} transition={{ duration:4.5, repeat:Infinity, ease:"easeInOut" }}>
                <BiometricHero/>
              </motion.div>
              <motion.div
                animate={{ y:[0,-7,0] }}
                transition={{ duration:4.5, repeat:Infinity, ease:"easeInOut", delay:0.8 }}
                style={{ marginTop:20 }}
              >
                <LiveCard/>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div className="stats-strip" style={{ position:"relative", zIndex:1 }}>
        {STATS.map((s,i) => (
          <Reveal key={i} delay={i*0.08}>
            <div className="stat-item">
              <div style={{ fontSize:28, fontWeight:800, color:"#0f172a", letterSpacing:"-1.5px", fontFamily:"'Inter',sans-serif" }}>{s.val}</div>
              <div style={{ fontSize:12, color:"#94a3b8", fontWeight:500, marginTop:4 }}>{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── Feature Cards ── */}
      <section id="features" className="section-wrap">
        <div className="section-inner" style={{ position:"relative", zIndex:1 }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div className="vai-badge vai-badge-indigo" style={{ marginBottom:16 }}>Capabilities</div>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,44px)", fontWeight:800, color:"#0f172a", letterSpacing:"-1.5px", lineHeight:1.12 }}>
                Everything you need to{" "}
                <span style={{
                  background:"linear-gradient(135deg,#a5b4fc,#6366f1)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                }}>verify identity</span>
              </h2>
              <p style={{ fontSize:16, color:"#64748b", marginTop:14, maxWidth:500, margin:"14px auto 0" }}>
                A complete biometric authentication stack — face, voice, and real-time AI in one platform.
              </p>
            </div>
          </Reveal>

          <div className="features-grid">
            {FEATURES.map((f,i) => (
              <Reveal key={i} delay={i*0.09}>
                <HoverCard accentColor={f.accent} glow={f.glow} style={{ padding:"30px 26px", height:"100%" }}>
                  {/* accent corner */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"20px 20px 0 0",
                    background:`linear-gradient(90deg,transparent,${f.accent},transparent)`, opacity:0.7 }}/>
                  <div style={{
                    width:52, height:52, borderRadius:14, marginBottom:18,
                    background:`${f.accent}18`, border:`1px solid ${f.accent}30`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:f.accent, boxShadow:`0 4px 20px ${f.accent}25`,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, color:"#0f172a", marginBottom:10, letterSpacing:"-0.3px" }}>{f.title}</div>
                  <div style={{ fontSize:13.5, color:"#64748b", lineHeight:1.65 }}>{f.desc}</div>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section id="security" className="section-wrap">
        <div className="section-inner" style={{ position:"relative", zIndex:1 }}>
          <Reveal>
            <div style={{
              background:"#ffffff",
              border:"1px solid rgba(0,0,0,0.08)",
              borderRadius:28, padding:"60px 48px",
              textAlign:"center",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{
                position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%",
                background:"radial-gradient(circle,rgba(34,197,94,0.10) 0%,transparent 70%)",
                filter:"blur(40px)", pointerEvents:"none",
              }}/>
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:200, height:1,
                background:"linear-gradient(90deg,transparent,rgba(34,197,94,0.5),transparent)" }}/>
              <div className="vai-badge vai-badge-green" style={{ marginBottom:20, display:"inline-flex" }}>Security</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, color:"#0f172a", letterSpacing:"-1.2px", marginBottom:14 }}>
                Built for security-first teams
              </h2>
              <p style={{ fontSize:16, color:"#64748b", maxWidth:500, margin:"0 auto 48px", lineHeight:1.65 }}>
                Every architectural decision was made with compliance and data protection in mind.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, textAlign:"left" }}>
                {[
                  { icon:"🔐", label:"AES-256 Encryption",   sub:"At rest & in transit" },
                  { icon:"🛡️", label:"SOC 2 Type II",        sub:"Annual audit certified" },
                  { icon:"🚫", label:"Zero Image Storage",   sub:"Only encrypted embeddings" },
                  { icon:"⚡", label:"99.9% Uptime SLA",     sub:"Globally distributed" },
                  { icon:"🇪🇺", label:"GDPR Ready",           sub:"EU residency available" },
                  { icon:"📋", label:"ISO 27001",             sub:"Certified ISMS framework" },
                ].map((b,i) => (
                  <motion.div key={i}
                    style={{
                      background:"#f0fdf4", border:"1px solid #bbf7d0",
                      borderRadius:14, padding:"18px 20px",
                    }}
                    whileHover={{ background:"#ecfdf5", borderColor:"#86efac", y:-3 }}
                    transition={{ duration:0.22 }}
                  >
                    <div style={{ fontSize:22, marginBottom:8 }}>{b.icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:4 }}>{b.label}</div>
                    <div style={{ fontSize:12, color:"#64748b", lineHeight:1.4 }}>{b.sub}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="docs" className="section-wrap" style={{ paddingBottom:120 }}>
        <div className="section-inner" style={{ position:"relative", zIndex:1 }}>
          <Reveal>
            <div style={{ textAlign:"center" }}>
              <div className="vai-badge vai-badge-indigo" style={{ marginBottom:20, display:"inline-flex" }}>Ready to start?</div>
              <h2 style={{ fontSize:"clamp(28px,4.5vw,52px)", fontWeight:800, color:"#0f172a", letterSpacing:"-2px", marginBottom:16, lineHeight:1.05 }}>
                Verify with your face.
                <br/>
                <span style={{
                  background:"linear-gradient(135deg,#67e8f9,#06b6d4,#6366f1)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                }}>
                  Not a password.
                </span>
              </h2>
              <p style={{ fontSize:16, color:"#64748b", maxWidth:440, margin:"0 auto 40px", lineHeight:1.65 }}>
                Register in 60 seconds. Enroll your biometrics once. Verify instantly, every time.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <GlowButton variant="primary" size="lg" icon={<ArrowIcon size={16}/>} onClick={() => navigate("/register")}>
                  Create Free Account
                </GlowButton>
                <GlowButton variant="secondary" size="lg" onClick={() => navigate("/login")}>
                  I have an account
                </GlowButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position:"relative", zIndex:1 }}>
        <div className="footer-inner">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{
                width:34, height:34, borderRadius:9,
                background:"linear-gradient(135deg,#4338ca,#6366f1)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
              }}><FingerprintIcon size={17}/></div>
              <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>VerifyAI</span>
            </div>
            <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, maxWidth:220 }}>
              Biometric identity verification for modern teams. Secure. Fast. Reliable.
            </p>
          </div>
          <div style={{ display:"flex", gap:48, flexWrap:"wrap" }}>
            {[
              { title:"Product", links:["Features","Pricing","Changelog","Status"] },
              { title:"Docs",    links:["Getting Started","API Reference","SDKs","Examples"] },
              { title:"Company", links:["About","Security","Privacy","Terms"] },
            ].map((col,i) => (
              <div key={i}>
                <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", fontFamily:"'Inter',sans-serif", letterSpacing:"1px", textTransform:"uppercase", marginBottom:14 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(l => (
                    <button key={l} style={{ background:"none", border:"none", fontSize:13.5, color:"#64748b", cursor:"pointer", textAlign:"left", fontFamily:"'Inter',sans-serif", padding:0, transition:"color 0.18s" }}
                      onMouseEnter={e => e.target.style.color="#0f172a"}
                      onMouseLeave={e => e.target.style.color="#64748b"}
                    >{l}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:1140, margin:"32px auto 0", paddingTop:24, borderTop:"1px solid #e2e8f0",
          display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontSize:12, color:"#94a3b8", fontFamily:"'Inter',sans-serif" }}>
            © {new Date().getFullYear()} VerifyAI, Inc. All rights reserved.
          </span>
          <div style={{ display:"flex", gap:14 }}>
            {["AES-256","SOC 2","GDPR"].map(b => (
              <div key={b} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#94a3b8", fontFamily:"'Inter',sans-serif" }}>
                <span style={{ color:"#22c55e" }}><ShieldIcon size={10}/></span>{b}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}