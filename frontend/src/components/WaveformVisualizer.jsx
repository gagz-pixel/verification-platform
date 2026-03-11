import { useEffect, useRef } from "react";

/**
 * WaveformVisualizer
 * Props:
 *   isRecording (bool) — starts/stops the mic stream
 *   barCount    (int)  — number of bars (default 40)
 *   color       (str)  — bar color (default #000000)
 *   height      (int)  — container height in px (default 80)
 */
export default function WaveformVisualizer({
  isRecording = false,
  barCount = 40,
  color = "#000000",
  height = 80,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startVisualizer();
    } else {
      stopVisualizer();
    }

    return () => stopVisualizer();
  }, [isRecording]);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawBars();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopVisualizer = () => {
    cancelAnimationFrame(animFrameRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    analyserRef.current = null;
    drawIdle();
  };

  const drawBars = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barWidth = (W / barCount) * 0.6;
      const gap = (W / barCount) * 0.4;

      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency data
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255; // 0 to 1
        const barHeight = Math.max(4, value * H * 0.9);

        const x = i * (barWidth + gap);
        const y = (H - barHeight) / 2;

        // Gradient per bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + "66"); // 40% opacity at bottom

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    render();
  };

  // Draw flat idle bars when not recording
  const drawIdle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const barWidth = (W / barCount) * 0.6;
    const gap = (W / barCount) * 0.4;

    for (let i = 0; i < barCount; i++) {
      const barHeight = 4;
      const x = i * (barWidth + gap);
      const y = (H - barHeight) / 2;

      ctx.fillStyle = "#e5e5e5"; // gray idle bars
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
  };

  // Draw idle bars on first mount
  useEffect(() => {
    drawIdle();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={height}
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "12px",
        background: "rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        display: "block",
      }}
    />
  );
}