"use client";

import { useAudioStore } from "@/lib/store";
import { INITIAL_TRACKS } from "@/data/tracks";
import { Header } from "@/components/navigation/Header";
import { NowPlayingHero } from "@/components/hero/NowPlayingHero";
import { TrackGrid } from "@/components/library/TrackGrid";
import { SyncedLyrics } from "@/components/lyrics/SyncedLyrics";
import { AudioCanvas } from "@/components/visualizer/AudioCanvas";
import { QueueDrawer } from "@/components/queue/QueueDrawer";
import { PlayerBar } from "@/components/player/PlayerBar";
import { Disc, Activity } from "lucide-react";

export default function DropBeatPage() {
  const activeView = useAudioStore((s) => s.activeView);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-neutral-800 selection:text-neutral-100">
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 blur-[120px] -z-10 transition-colors duration-700"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 15%, rgba(${ambientRgb}, 0.35), transparent 70%)`
        }}
      />

      {/* Persistent Navigation Header */}
      <Header />

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-32">
        {activeView === "library" && (
          <div className="space-y-10">
            {/* Spotlight Hero Stage */}
            <NowPlayingHero />

            {/* Catalog Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-neutral-400" />
                  <h2 className="text-base font-semibold text-neutral-100">
                    Curated Soundscapes
                  </h2>
                </div>
                <span className="text-xs text-neutral-400 font-sans">
                  {INITIAL_TRACKS.length} master recordings
                </span>
              </div>

              <TrackGrid tracks={INITIAL_TRACKS} />
            </div>
          </div>
        )}

        {activeView === "lyrics" && (
          <div className="w-full max-w-3xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl">
              <SyncedLyrics />
            </div>
          </div>
        )}

        {activeView === "visualizer" && (
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
        )}

        {activeView === "queue" && (
          <div className="w-full max-w-3xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl">
              <QueueDrawer />
            </div>
          </div>
        )}
      </main>

      {/* Hallmark Persistent Player Bar */}
      <PlayerBar />
    </div>
  );
}
