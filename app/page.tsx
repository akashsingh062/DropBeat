"use client";

import { useAudioStore } from "@/lib/store";
import { INITIAL_TRACKS } from "@/data/tracks";
import { Header } from "@/components/navigation/Header";
import { NowPlayingHero } from "@/components/hero/NowPlayingHero";
import { PlaylistSelector } from "@/components/library/PlaylistSelector";
import { TrackGrid } from "@/components/library/TrackGrid";
import { YouTubeSearchStage } from "@/components/search/YouTubeSearchStage";
import { SyncedLyrics } from "@/components/lyrics/SyncedLyrics";
import { AudioCanvas } from "@/components/visualizer/AudioCanvas";
import { QueueDrawer } from "@/components/queue/QueueDrawer";
import { PlayerBar } from "@/components/player/PlayerBar";
import { AutoplayNotification } from "@/components/player/AutoplayNotification";
import { Activity, Search } from "lucide-react";

export default function DropBeatPage() {
  const activeView = useAudioStore((s) => s.activeView);
  const setActiveView = useAudioStore((s) => s.setActiveView);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-neutral-800 selection:text-neutral-100 overflow-x-clip">
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 blur-[120px] -z-10 transition-colors duration-700"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 15%, rgba(${ambientRgb}, 0.35), transparent 70%)`
        }}
      />

      {/* Persistent Navigation Header with Global Search */}
      <Header />

      {/* Main Workspace Stage - Views kept persistently in DOM to prevent re-mounting flash */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-5 pb-32">
        {/* Catalog / Library View */}
        <div className={activeView === "library" ? "block space-y-8" : "hidden"}>
          {/* Top Quick-Search Callout Strip */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
            <div
              className="flex items-center gap-2.5 flex-1 cursor-pointer"
              onClick={() => setActiveView("search")}
            >
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-xs sm:text-sm text-neutral-300 select-none">
                Search any song, artist, or paste a link from YouTube…
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-950 text-[10px] font-mono text-neutral-400">
                /
              </kbd>
              <button
                type="button"
                onClick={() => setActiveView("search")}
                className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              >
                Search Music
              </button>
            </div>
          </div>

          {/* Spotlight Hero Stage */}
          <NowPlayingHero />

          {/* Curated YouTube Playlists Section */}
          <PlaylistSelector />

          {/* Active Playlist Tracks & YouTube Search Grid */}
          <TrackGrid tracks={INITIAL_TRACKS} />
        </div>

        {/* Dedicated YouTube Search Stage */}
        <div className={activeView === "search" ? "block" : "hidden"}>
          <YouTubeSearchStage />
        </div>

        {/* Synced Lyrics Stage */}
        <div className={activeView === "lyrics" ? "block" : "hidden"}>
          <div className="w-full max-w-3xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl">
              <SyncedLyrics />
            </div>
          </div>
        </div>

        {/* Real-time Visualizer Stage */}
        <div className={activeView === "visualizer" ? "block" : "hidden"}>
          <div className="w-full max-w-4xl mx-auto py-4 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neutral-300" />
                    <span>Real-Time Frequency Analysis</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Harmonic resonance mapped to {currentTrack?.bpm || 110} beats per minute
                  </p>
                </div>
              </div>

              <div className="w-full h-80 rounded-xl bg-neutral-950/70 border border-neutral-800/80 overflow-hidden p-4">
                <AudioCanvas className="w-full h-full" variant="spectrum" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60">
                  <span className="text-[11px] text-neutral-500 block">Current Tempo</span>
                  <span className="text-sm text-neutral-200 font-semibold font-sans">
                    {currentTrack?.bpm || 110} BPM
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60">
                  <span className="text-[11px] text-neutral-500 block">Dynamic Accent</span>
                  <span className="text-sm text-neutral-200 font-semibold font-sans">
                    rgb({ambientRgb})
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60">
                  <span className="text-[11px] text-neutral-500 block">Sound Stage</span>
                  <span className="text-sm text-neutral-200 font-semibold font-sans">
                    Stereo 48kHz
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60">
                  <span className="text-[11px] text-neutral-500 block">Harmonics</span>
                  <span className="text-sm text-neutral-200 font-semibold font-sans">
                    48 Band FFT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Queue Drawer Stage */}
        <div className={activeView === "queue" ? "block" : "hidden"}>
          <div className="w-full max-w-3xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl">
              <QueueDrawer />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Upcoming Autoplay Recommendation Card */}
      <AutoplayNotification />

      {/* Hallmark Persistent Player Bar */}
      <PlayerBar />
    </div>
  );
}
