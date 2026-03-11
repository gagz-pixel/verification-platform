import { motion } from "framer-motion";

/**
 * GlassCard — clean white card with soft shadow for the light theme.
 * Props:
 *   children, className, style
 *   hover     (bool)   — enable hover lift+shadow (default true)
 *   glow      (string) — accent ring color on hover
 *   padding   (string) — CSS padding (default "28px 32px")
 *   onClick
 */
export default function GlassCard({
  children,
  className = "",
  style = {},
  hover = true,
  glow = "rgba(99,102,241,0.18)",
  padding = "28px 32px",
  onClick,
}) {
  const base = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "20px",
    padding,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)",
    ...style,
  };

  if (!hover) {
    return (
      <div className={className} style={base} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={base}
      onClick={onClick}
      whileHover={{
        scale: 1.015,
        boxShadow: `0 8px 48px rgba(0,0,0,0.10), 0 0 0 1.5px ${glow}`,
        y: -3,
      }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}