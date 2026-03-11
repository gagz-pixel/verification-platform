import { motion } from "framer-motion";

/**
 * GlowButton â€” modern button for white/light theme.
 * Props:
 *   children, onClick, disabled, loading
 *   variant: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline"
 *   size:    "sm" | "md" | "lg"
 *   fullWidth (bool)
 *   icon (ReactNode) â€” left icon
 */
export default function GlowButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  style = {},
  type = "button",
}) {
  const variants = {
    primary: {
      background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
      color: "#fff",
      border: "1px solid transparent",
      shadow: "0 4px 14px rgba(99,102,241,0.30)",
      hoverShadow: "0 8px 28px rgba(99,102,241,0.42)",
    },
    secondary: {
      background: "#ffffff",
      color: "#0f172a",
      border: "1px solid #e2e8f0",
      shadow: "0 1px 3px rgba(0,0,0,0.07)",
      hoverShadow: "0 4px 16px rgba(0,0,0,0.10)",
    },
    danger: {
      background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      color: "#fff",
      border: "1px solid transparent",
      shadow: "0 4px 14px rgba(239,68,68,0.25)",
      hoverShadow: "0 8px 24px rgba(239,68,68,0.38)",
    },
    ghost: {
      background: "transparent",
      color: "#475569",
      border: "1px solid rgba(0,0,0,0.10)",
      shadow: "none",
      hoverShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    success: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      color: "#fff",
      border: "1px solid transparent",
      shadow: "0 4px 14px rgba(16,185,129,0.25)",
      hoverShadow: "0 8px 24px rgba(16,185,129,0.38)",
    },
    outline: {
      background: "transparent",
      color: "#6366f1",
      border: "1.5px solid #c7d2fe",
      shadow: "none",
      hoverShadow: "0 4px 12px rgba(99,102,241,0.14)",
    },
  };

  const sizes = {
    sm: { padding: "7px 16px", fontSize: "13px", borderRadius: "8px", gap: "5px" },
    md: { padding: "10px 22px", fontSize: "14px", borderRadius: "10px", gap: "7px" },
    lg: { padding: "13px 28px", fontSize: "15px", borderRadius: "12px", gap: "8px" },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        background: v.background,
        color: v.color,
        border: v.border,
        borderRadius: s.borderRadius,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.55 : 1,
        boxShadow: v.shadow,
        position: "relative",
        overflow: "hidden",
        transition: "opacity 0.2s",
        ...style,
      }}
      whileHover={!disabled && !loading ? {
        y: -1,
        boxShadow: v.hoverShadow,
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      {loading ? (
        <motion.svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </motion.svg>
      ) : icon}
      {children}
    </motion.button>
  );
}
