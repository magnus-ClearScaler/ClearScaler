import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/milena")({
  component: MilenaPage,
});

const OPTIONS = [
  { label: "Go straight\nto Donna", color: "#FF6B9D", textColor: "#fff" },
  { label: "Go to\nsleep", color: "#6C63FF", textColor: "#fff" },
  { label: "Salsa 💃", color: "#FF9F43", textColor: "#fff" },
  { label: "Meet Magnus\na bit later", color: "#26C6DA", textColor: "#fff" },
];

const NUM = OPTIONS.length;
const ARC = (2 * Math.PI) / NUM;

function drawWheel(canvas: HTMLCanvasElement, angle: number) {
  const ctx = canvas.getContext("2d")!;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - 6;

  ctx.clearRect(0, 0, size, size);

  // Segments
  OPTIONS.forEach((opt, i) => {
    const start = angle + i * ARC;
    const end = start + ARC;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = opt.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + ARC / 2);

    const lines = opt.label.split("\n");
    const fontSize = size / 22;
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = opt.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lineH = fontSize * 1.35;
    const totalH = lines.length * lineH;
    const xPos = r * 0.62;
    lines.forEach((line, li) => {
      ctx.fillText(line, xPos, -totalH / 2 + li * lineH + lineH / 2);
    });

    ctx.restore();
  });

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Center hub
  const hubR = size / 11;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, "#e0e0e0");
  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center star / dot
  ctx.beginPath();
  ctx.arc(cx, cy, hubR * 0.25, 0, 2 * Math.PI);
  ctx.fillStyle = "#ccc";
  ctx.fill();
}

function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(-Math.PI / 2 - ARC / 2); // Start so segment 0 is at top
  const rafRef = useRef<number>(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof OPTIONS)[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const size = Math.min(window.innerWidth * 0.85, 420);
      canvas.width = size;
      canvas.height = size;
      drawWheel(canvas, angleRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setShowResult(false);
    setResult(null);

    const winner = Math.floor(Math.random() * NUM);
    // Spin 6–9 full rotations, land with winner centred at top (pointer)
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const targetAngle =
      -Math.PI / 2 - (winner + 0.5) * ARC - (Math.random() * ARC * 0.6 - ARC * 0.3);
    const delta = fullSpins + ((targetAngle - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const start = angleRef.current;
    const duration = 4200 + Math.random() * 800;
    const t0 = performance.now();

    const canvas = canvasRef.current!;

    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      // Ease-out quart
      const eased = 1 - Math.pow(1 - p, 4);
      angleRef.current = start + delta * eased;
      drawWheel(canvas, angleRef.current);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setSpinning(false);
        setResult(OPTIONS[winner]);
        setTimeout(() => setShowResult(true), 100);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="relative">
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "24px solid white",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
            zIndex: 10,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: "50%",
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.3), 0 24px 64px rgba(0,0,0,0.55)",
            display: "block",
          }}
        />
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        style={{
          padding: "14px 52px",
          fontSize: "18px",
          fontWeight: 800,
          letterSpacing: "0.04em",
          background: spinning
            ? "rgba(255,255,255,0.2)"
            : "linear-gradient(135deg, #FF6B9D, #FF9F43)",
          color: "white",
          border: "none",
          borderRadius: "999px",
          cursor: spinning ? "not-allowed" : "pointer",
          boxShadow: spinning ? "none" : "0 8px 24px rgba(255,107,157,0.5)",
          transition: "all 0.25s ease",
          transform: spinning ? "scale(0.97)" : "scale(1)",
        }}
      >
        {spinning ? "Spinning…" : "✨  Spin!"}
      </button>

      {/* Result card */}
      {result && (
        <div
          style={{
            opacity: showResult ? 1 : 0,
            transform: showResult ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `2px solid ${result.color}`,
            borderRadius: "20px",
            padding: "20px 36px",
            textAlign: "center",
            maxWidth: "360px",
            width: "100%",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
            Tonight, Milena should…
          </p>
          <p style={{ color: "white", fontSize: "22px", fontWeight: 800, lineHeight: 1.3 }}>
            {result.label.replace("\n", " ")}
          </p>
        </div>
      )}
    </div>
  );
}

function MilenaPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "40px 20px",
      }}
    >
      {/* Background photo */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url(/images/milena.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          filter: "brightness(0.45) blur(3px)",
          transform: "scale(1.06)",
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(108,99,255,0.35) 0%, rgba(20,10,40,0.65) 100%)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>
          The big question…
        </p>
        <h1
          style={{
            color: "white",
            fontSize: "clamp(26px, 6vw, 38px)",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "32px",
            textShadow: "0 2px 24px rgba(0,0,0,0.4)",
          }}
        >
          What should Milena<br />do today? 🌟
        </h1>
        <SpinWheel />
      </div>
    </div>
  );
}
