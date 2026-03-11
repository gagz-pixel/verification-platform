import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * HoverCard — interactive tilt + accent glow card for light theme.
 * Props:
 *   children, style, className
 *   accentColor (string) — CSS color for accent top-edge
 *   intensity   (number) — tilt intensity, default 8 (degrees)
 */
export default function HoverCard({
  children,
  style = {},
  className = "",
  accentColor = "#6366f1",
  intensity = 8,
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    setTilt({ x: -dy * intensity, y: dx * intensity });
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => setIsHovered(true);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        position: "relative",
        background: "#ffffff",
        border: `1px solid ${isHovered ? accentColor + "28" : "rgba(0,0,0,0.07)"}`,
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "default",
        willChange: "transform",
        transformStyle: "preserve-3d",
        transition: "border-color 0.3s",
        ...style,
      }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? 1.02 : 1,
        boxShadow: isHovered
          ? `0 16px 56px rgba(0,0,0,0.10), 0 0 24px ${accentColor}18`
          : "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Radial glow following cursor */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        borderRadius: "inherit", zIndex: 0,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.3s",
        background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${accentColor}10 0%, transparent 60%)`,
      }} />
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
        opacity: isHovered ? 1 : 0.35,
        transition: "opacity 0.3s",
        pointerEvents: "none",
        zIndex: 1,
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}