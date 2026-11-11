"use client";

import { useAudioStore } from "@/lib/store";
import { Play, Pause, ListPlus, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

export function NowPlayingHero() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const jumpToDrop = useAudioStore((s) => s.jumpToDrop);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const setActiveView = useAudioStore((s) => s.setActiveView);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  if (!currentTrack) return null;

  const isPlaying = playbackStatus === "playing";

  return (
    <section
      aria-label="Current Track Spotlight"
      className="relative w-full rounded-2xl bg-neutral-900/40 border border-neutral-800/80 p-6 sm:p-8 backdrop-blur-xl overflow-hidden transition-colors duration-500"
      style={{
        boxShadow: `0 20px 80px -20px rgba(${ambientRgb}, 0.25)`
      }}
    >
      {/* Ambient background bloom */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl transition-[background-color,opacity] duration-700"
        style={{
          backgroundColor: `rgb(${ambientRgb})`
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
        {/* Left column: Vinyl deck presentation */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="relative group">
            {/* Tactile vinyl record peaking out */}
            <div
              className={`absolute top-0 right-0 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-2xl flex items-center justify-center transition-transform duration-700 ease-out ${
                isPlaying
                  ? "translate-x-12 sm:translate-x-16 rotate-45 animate-[spin_8s_linear_infinite]"
                  : "translate-x-4 group-hover:translate-x-8"
              }`}
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle, var(--vinyl-groove-light), var(--vinyl-groove-light) 2px, var(--vinyl-groove-dark) 3px, var(--vinyl-groove-dark) 4px)"
              }}
            >
              <div
                className="w-16 h-16 rounded-full border-2 border-neutral-700 flex items-center justify-center"
                style={{ backgroundColor: `rgba(${ambientRgb}, 0.4)` }}
              >
                <div className="w-4 h-4 rounded-full bg-neutral-950 border border-neutral-600" />
              </div>
            </div>

            {/* Track Album Artwork Card */}
            <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-700/60">
              <Image
                src={currentTrack.coverUrl}
                alt={`Album artwork for ${currentTrack.title}`}
                fill
                sizes="(max-width: 640px) 176px, 208px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right column: Track identity & primary actions */}
        <div className="flex flex-col items-start md:items-start text-left flex-1 min-w-0 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-neutral-400 font-sans">
              {currentTrack.genre}
            </span>
            {currentTrack.bpm && (
              <span className="text-xs text-neutral-400 font-sans">
                {currentTrack.bpm} beats per minute
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-2 break-words">
            {currentTrack.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-normal mb-6">
            {currentTrack.artist} {currentTrack.album ? `(${currentTrack.album})` : `· ${currentTrack.genre}`}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="px-6 py-2.5 rounded-full bg-neutral-100 text-neutral-950 font-medium text-sm flex items-center gap-2 hover:bg-neutral-200 active:scale-95 transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause track</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Listen now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={jumpToDrop}
              className="px-4 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-medium text-sm flex items-center gap-1.5 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Jump to Drop</span>
            </button>

            <button
              type="button"
              onClick={() => addToQueue(currentTrack)}
              className="p-2.5 rounded-full bg-neutral-800/80 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 border border-neutral-700/60 active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              aria-label="Add current track to playback queue"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
