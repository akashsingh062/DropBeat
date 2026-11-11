"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/store";
import { Mic2 } from "lucide-react";

export function SyncedLyrics() {
  const lyrics = useAudioStore((s) => s.lyrics);
  const currentTime = useAudioStore((s) => s.currentTime);
  const seekTo = useAudioStore((s) => s.seekTo);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  // Find index of current lyric line
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smoothly scroll active line to center
  useEffect(() => {
    if (!containerRef.current || !activeLineRef.current) return;
    const container = containerRef.current;
    const activeEl = activeLineRef.current;

    const targetScroll =
      activeEl.offsetTop - container.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;

    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }, [activeIndex]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400 min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
          <Mic2 className="w-5 h-5 text-neutral-500" />
        </div>
        <h3 className="text-sm font-medium text-neutral-200 mb-1">
          Lyrics unavailable for this track
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm">
          Searching LRCLIB registry for {currentTrack?.title} by {currentTrack?.artist}…
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4 px-2">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Mic2 className="w-3.5 h-3.5 text-neutral-300" />
          <span>Synchronized LRCLIB Feed</span>
        </div>
        <span className="text-xs text-neutral-500">Click any line to scrub</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-4 px-2 py-8 scroll-smooth"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
        }}
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <button
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              type="button"
              onClick={() => seekTo(line.time)}
              className={`w-full text-left py-2.5 px-4 rounded-lg flex items-baseline justify-between group transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                isActive
                  ? "bg-neutral-900/90 text-neutral-100 shadow-md border border-neutral-800"
                  : isPassed
                  ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
              }`}
            >
              <span
                className={`text-base sm:text-lg leading-relaxed font-normal tracking-normal transition-[color,transform] ${
                  isActive ? "font-medium scale-[1.01]" : ""
                }`}
                style={
                  isActive
                    ? {
                        color: `rgb(${ambientRgb})`,
                        textShadow: `0 0 20px rgba(${ambientRgb}, 0.35)`
                      }
                    : undefined
                }
              >
                {line.text}
              </span>
              <span className="text-xs text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                {formatSeconds(line.time)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
