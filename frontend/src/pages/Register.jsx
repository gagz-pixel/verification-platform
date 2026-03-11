import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "../services/authService";
import AnimatedBackground from "../components/AnimatedBackground";
import GlowButton from "../components/GlowButton";

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#8b5cf6" },
    { label: "Strong", color: "#22c55e" },
    { label: "Very Strong", color: "#10b981" },
  ];
  return { score, ...levels[score] };
};

function Field({ label, id, type, value, onChange, placeholder, autoComplete, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7,
      }}>
        {label}
      </label>
      <div style={{
        position: "relative", borderRadius: 10,
        border: focused ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
        background: focused ? "#fafbff" : "#ffffff",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.18s",
      }}>
        <input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "11px 14px",
            paddingRight: rightSlot ? "42px" : "14px",
            background: "transparent", border: "none", outline: "none",
            color: "#0f172a", fontSize: 14.5,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        />
        {rightSlot}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const strength = getPasswordStrength(form.password);
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!agreed) { setError("Please agree to the terms."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await registerUser(form);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/register-face");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`input::placeholder { color: #94a3b8 !important; }`}</style>
      <AnimatedBackground />
      <motion.div
        style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 16px", position: "relative", zIndex: 1,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      >
        <motion.div
          style={{ width: "100%", maxWidth: 440 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>VerifyAI</span>
          </div>

          {/* Card */}
          <div style={{
            background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20,
            padding: "36px 32px", position: "relative", overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "20px 20px 0 0",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
            }}/>

            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 5 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                Set up biometric verification in minutes
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 10, padding: "10px 12px",
                    fontSize: 13, color: "#dc2626", marginBottom: 18, lineHeight: 1.45,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>
              <Field id="name" label="Full Name" type="text" value={form.name}
                onChange={handleChange("name")} placeholder="John Doe" autoComplete="name"/>

              <Field id="email" label="Email" type="email" value={form.email}
                onChange={handleChange("email")} placeholder="you@example.com" autoComplete="email"/>

              <Field id="password" label="Password" type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange("password")}
                placeholder="Min 8 characters" autoComplete="new-password"
                rightSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#94a3b8", display: "flex", alignItems: "center", padding: 4,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                  >
                    <EyeIcon open={showPassword}/>
                  </button>
                }
              />

              {/* Strength bar */}
              {form.password && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20, marginTop: -4 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <motion.div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength.score ? strength.color : "#f1f5f9",
                      }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08 }}/>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>{strength.label}</span>
                </motion.div>
              )}

              {/* Terms */}
              <div style={{ marginBottom: 24, marginTop: form.password ? 0 : 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setAgreed(!agreed)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `1.5px solid ${agreed ? "#6366f1" : "#e2e8f0"}`,
                    background: agreed ? "#6366f1" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.18s", color: "#fff",
                  }}>
                    {agreed && <CheckIcon/>}
                  </div>
                  <span style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
              </div>

              <GlowButton type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading || !agreed}>
                {loading ? "Creating account…" : "Create Account"}
              </GlowButton>
            </form>

            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              margin: "20px 0", color: "#cbd5e1", fontSize: 12,
            }}>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }}/>
              or
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }}/>
            </div>

            <p style={{ textAlign: "center", fontSize: 13.5, color: "#64748b" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, marginTop: 20, fontSize: 11.5, color: "#94a3b8",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            256-bit AES encrypted
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
