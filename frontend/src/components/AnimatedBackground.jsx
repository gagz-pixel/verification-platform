/**
 * AnimatedBackground — premium light minimal background with soft floating gradient blobs.
 * White/light-gray theme for clean SaaS aesthetic.
 */
export default function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes blob-drift-a {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-40px) scale(1.08); }
          66%      { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes blob-drift-b {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-70px,30px) scale(1.06); }
          70%      { transform: translate(40px,-60px) scale(0.97); }
        }
        @keyframes blob-drift-c {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,70px) scale(1.1); }
        }
        .vai-bg-light {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
          background: #f8fafc;
        }
        .vai-blob {
          position: absolute; border-radius: 50%;
          filter: blur(90px); will-change: transform;
        }
        .vai-blob-1 {
          width: 700px; height: 700px; top: -180px; left: -120px;
          background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%);
          animation: blob-drift-a 18s ease-in-out infinite;
        }
        .vai-blob-2 {
          width: 600px; height: 600px; top: 15%; right: -180px;
          background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
          animation: blob-drift-b 22s ease-in-out infinite;
        }
        .vai-blob-3 {
          width: 500px; height: 500px; bottom: -80px; left: 28%;
          background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%);
          animation: blob-drift-c 26s ease-in-out infinite;
        }
        .vai-blob-4 {
          width: 400px; height: 400px; bottom: 25%; left: -60px;
          background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%);
          animation: blob-drift-a 30s ease-in-out infinite reverse;
        }
      `}</style>
      <div className="vai-bg-light">
        <div className="vai-blob vai-blob-1" />
        <div className="vai-blob vai-blob-2" />
        <div className="vai-blob vai-blob-3" />
        <div className="vai-blob vai-blob-4" />
      </div>
    </>
  );
}