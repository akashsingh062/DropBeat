"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/lib/store";

interface AudioCanvasProps {
  className?: string;
  variant?: "spectrum" | "wave" | "radial";
}

export function AudioCanvas({ className = "", variant = "spectrum" }: AudioCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  const [mode, setMode] = useState<"spectrum" | "wave" | "radial">(variant);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Energy multipliers based on playback and volume
    const bpm = currentTrack?.bpm || 110;
    const beatSpeed = (bpm / 60) * 0.05;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const isPlaying = playbackStatus === "playing";
      const volMultiplier = isMuted ? 0 : volume / 100;
      const activity = isPlaying ? Math.max(0.2, volMultiplier) : 0.08;

      phaseRef.current += beatSpeed * (isPlaying ? 1 : 0.2);
      const phase = phaseRef.current;

      const [r, g, b] = ambientRgb.split(",").map((c) => parseInt(c.trim(), 10) || 120);

      if (mode === "spectrum") {
        // High-density equalizer spectrum bars
        const numBars = 48;
        const barSpacing = 4;
        const totalSpacing = (numBars - 1) * barSpacing;
        const barWidth = Math.max(2, (width - totalSpacing) / numBars);

        for (let i = 0; i < numBars; i++) {
          const norm = i / numBars;
          // Harmonic wave formula combining sine waves of different frequencies
          const harmonic1 = Math.sin(phase * 1.5 + norm * Math.PI * 3);
          const harmonic2 = Math.cos(phase * 2.3 + norm * Math.PI * 5);
          const harmonic3 = Math.sin(phase * 0.8 + norm * Math.PI * 1.2);
          
          let barHeightNorm = Math.abs(harmonic1 * 0.5 + harmonic2 * 0.3 + harmonic3 * 0.2);
          barHeightNorm = Math.pow(barHeightNorm, 1.2) * activity;
          const barHeight = Math.max(4, barHeightNorm * (height * 0.75));

          const x = i * (barWidth + barSpacing);
          const y = height - barHeight;

          // Gradient fill with ambient colors
          const gradient = ctx.createLinearGradient(x, y, x, height);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 + barHeightNorm * 0.6})`);
          gradient.addColorStop(1, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.1)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else if (mode === "wave") {
        // Fluid oscilloscope wave
        ctx.beginPath();
        const numPoints = 80;
        const step = width / numPoints;
        const centerY = height / 2;

        ctx.moveTo(0, centerY);

        for (let i = 0; i <= numPoints; i++) {
          const x = i * step;
          const norm = i / numPoints;
          const wave1 = Math.sin(phase * 2 + norm * 8) * 35;
          const wave2 = Math.sin(phase * 3.5 + norm * 16) * 18;
          const wave3 = Math.cos(phase * 1.2 + norm * 4) * 20;

          const y = centerY + (wave1 + wave2 + wave3) * activity;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Echo wave line with lower opacity
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const x = i * step;
          const norm = i / numPoints;
          const wave1 = Math.sin(phase * 1.6 + norm * 7) * 22;
          const y = centerY + wave1 * activity;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (mode === "radial") {
        // Circular orbital frequency harmonics
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.28;
        const numRays = 64;

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const freq = Math.abs(Math.sin(phase * 2 + (i / numRays) * Math.PI * 6)) * activity;
          const rayLength = 6 + freq * 60;

          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + rayLength);
          const y2 = centerY + Math.sin(angle) * (baseRadius + rayLength);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + freq * 0.7})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Center ambient pulse
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.95, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playbackStatus, currentTrack, volume, isMuted, ambientRgb, mode]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        aria-label="Realtime audio frequency visualizer"
        className="w-full h-full min-h-[160px] block"
      />
      {/* Visualizer Mode Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md p-1 rounded-md border border-neutral-800">
        {(["spectrum", "wave", "radial"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
              mode === m
                ? "bg-neutral-800 text-neutral-100 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

