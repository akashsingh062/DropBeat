"use client";

import { useAudioStore } from "@/lib/store";
import { AppView } from "@/types/music";
import { Disc, Mic2, Activity, ListMusic, Radio } from "lucide-react";

export function Header() {
  const activeView = useAudioStore((s) => s.activeView);
  const setActiveView = useAudioStore((s) => s.setActiveView);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  const isPlaying = playbackStatus === "playing";

  const navItems: Array<{ id: AppView; label: string; icon: typeof Disc }> = [
    { id: "library", label: "Catalog", icon: Disc },
    { id: "lyrics", label: "Lyrics", icon: Mic2 },
    { id: "visualizer", label: "Visualizer", icon: Activity },
    { id: "queue", label: "Queue", icon: ListMusic },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/80 backdrop-blur-2xl border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveView("library")}
        >
          <div
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center transition-shadow"
            style={{
              boxShadow: `0 0 15px rgba(${ambientRgb}, 0.3)`
            }}
          >
            <Radio className="w-4 h-4 text-neutral-100" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-neutral-100 leading-none">
              DropBeat
            </span>
            <span className="text-[10px] text-neutral-400 font-sans leading-tight mt-0.5">
              Atmospheric Audio Deck
            </span>
          </div>
        </div>

        {/* View switcher navigation */}
        <nav aria-label="Audio deck modes" className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                  isActive
                    ? "bg-neutral-800 text-neutral-100 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Currently playing live status indicator */}
        <div className="hidden lg:flex items-center gap-3 bg-neutral-900/40 px-3 py-1.5 rounded-full border border-neutral-800/80">
          <div className="flex items-end gap-0.5 h-3">
            <span
              className={`w-0.5 bg-neutral-400 rounded-full ${
                isPlaying ? "animate-[bounce_0.8s_ease-in-out_infinite]" : "h-1"
              }`}
            />
            <span
              className={`w-0.5 bg-neutral-300 rounded-full ${
                isPlaying ? "animate-[bounce_1.2s_ease-in-out_infinite_0.2s]" : "h-2"
              }`}
            />
            <span
              className={`w-0.5 bg-neutral-200 rounded-full ${
                isPlaying ? "animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" : "h-1.5"
              }`}
            />
          </div>
          <span className="text-xs text-neutral-400 max-w-[140px] truncate font-sans">
            {currentTrack?.title || "No track active"}
          </span>
        </div>
      </div>
    </header>
  );
}
