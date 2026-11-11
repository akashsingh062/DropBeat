"use client";

import { useState } from "react";
import { useAudioStore } from "@/lib/store";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  Activity,
  ListMusic,
  Zap
} from "lucide-react";
import Image from "next/image";

export function PlayerBar() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const isShuffle = useAudioStore((s) => s.isShuffle);
  const repeatMode = useAudioStore((s) => s.repeatMode);
  const activeView = useAudioStore((s) => s.activeView);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);
  const isHookMode = useAudioStore((s) => s.isHookMode);

  const togglePlay = useAudioStore((s) => s.togglePlay);
  const toggleHookMode = useAudioStore((s) => s.toggleHookMode);
  const jumpToDrop = useAudioStore((s) => s.jumpToDrop);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const prevTrack = useAudioStore((s) => s.prevTrack);
  const seekTo = useAudioStore((s) => s.seekTo);
  const setVolume = useAudioStore((s) => s.setVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const cycleRepeat = useAudioStore((s) => s.cycleRepeat);
  const setActiveView = useAudioStore((s) => s.setActiveView);

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverSeekPos, setHoverSeekPos] = useState<number | null>(null);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);

  const isPlaying = playbackStatus === "playing";
  const isBuffering = playbackStatus === "buffering";

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    setHoverSeekPos(ratio * duration);
  };

  if (!currentTrack) return null;

  return (
    <footer
      aria-label="Persistent Audio Player Deck"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-2xl border-t border-neutral-800/80 px-4 py-3 sm:px-6 transition-colors duration-500"
      style={{
        boxShadow: `0 -10px 40px -10px rgba(${ambientRgb}, 0.15)`
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-full md:w-1/4 shrink-0">
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
            <Image
              src={currentTrack.thumbnailUrl || currentTrack.coverUrl}
              alt={currentTrack.title}
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-neutral-100 truncate">
              {currentTrack.title}
            </span>
            <span className="text-xs text-neutral-400 truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/4 max-w-2xl">
          {/* Action buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={isShuffle}
              className={`p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 active:scale-95 ${
                isShuffle
                  ? "text-neutral-100 bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={prevTrack}
              aria-label="Previous track"
              className="p-1.5 rounded-md text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              type="button"
              onClick={togglePlay}
              disabled={isBuffering}
              aria-label={isPlaying ? "Pause track" : "Play track"}
              className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center hover:bg-neutral-200 transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 shadow-md disabled:opacity-50"
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next track"
              className="p-1.5 rounded-md text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={cycleRepeat}
              aria-label={`Cycle repeat mode: currently ${repeatMode}`}
              aria-pressed={repeatMode !== "off"}
              className={`p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 active:scale-95 ${
                repeatMode !== "off"
                  ? "text-neutral-100 bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>

            {/* Hook / Drop Mode Button */}
            <button
              type="button"
              onClick={toggleHookMode}
              title="Click to toggle Hook Mode; double-click to jump to Drop immediately"
              aria-label={isHookMode ? "Disable Drop Mode" : "Enable Drop Mode (auto-jumps to chorus/peak)"}
              aria-pressed={isHookMode}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 active:scale-95 ${
                isHookMode
                  ? "bg-amber-400 text-neutral-950 border border-amber-300 shadow-md"
                  : "text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30"
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Drop</span>
            </button>
          </div>

          {/* Scrubber line */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-500 w-8 text-right select-none">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-5 flex items-center cursor-pointer group"
              onClick={handleSeekClick}
              onMouseEnter={() => setIsHoveringSeek(true)}
              onMouseLeave={() => {
                setIsHoveringSeek(false);
                setHoverSeekPos(null);
              }}
              onMouseMove={handleSeekMouseMove}
            >
              {/* Track bar background */}
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-200 group-hover:bg-neutral-100 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Hover preview tooltip */}
              {isHoveringSeek && hoverSeekPos !== null && (
                <div
                  className="absolute -top-7 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-200 rounded pointer-events-none -translate-x-1/2"
                  style={{
                    left: `${(hoverSeekPos / duration) * 100}%`
                  }}
                >
                  {formatTime(hoverSeekPos)}
                </div>
              )}
            </div>

            <span className="text-[11px] font-mono text-neutral-500 w-8 select-none">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & View Triggers */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          {/* View Triggers */}
          <div className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800/80">
            <button
              type="button"
              onClick={() => setActiveView(activeView === "lyrics" ? "library" : "lyrics")}
              aria-label="Toggle synchronized lyrics"
              aria-pressed={activeView === "lyrics"}
              className={`p-1.5 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                activeView === "lyrics"
                  ? "bg-neutral-800 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView(activeView === "visualizer" ? "library" : "visualizer")}
              aria-label="Toggle audio visualizer stage"
              aria-pressed={activeView === "visualizer"}
              className={`p-1.5 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                activeView === "visualizer"
                  ? "bg-neutral-800 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView(activeView === "queue" ? "library" : "queue")}
              aria-label="Toggle queue playlist"
              aria-pressed={activeView === "queue"}
              className={`p-1.5 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                activeView === "queue"
                  ? "bg-neutral-800 text-neutral-100 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume slider with floating percentage tooltip */}
          <div
            className="relative flex items-center gap-2"
            onMouseEnter={() => setIsHoveringVolume(true)}
            onMouseLeave={() => setIsHoveringVolume(false)}
          >
            {isHoveringVolume && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-200 rounded pointer-events-none shadow-md z-50 select-none whitespace-nowrap"
              >
                {isMuted ? "0%" : `${Math.round(volume)}%`}
              </div>
            )}

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume adjustment"
              className="w-16 sm:w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
