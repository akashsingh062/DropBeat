"use client";

import { useAudioStore } from "@/lib/store";
import { Play, X, Sparkles } from "lucide-react";
import Image from "next/image";

export function AutoplayNotification() {
  const autoplayRecommendation = useAudioStore((s) => s.autoplayRecommendation);
  const autoplayCountdown = useAudioStore((s) => s.autoplayCountdown);
  const isAutoplayDismissed = useAudioStore((s) => s.isAutoplayDismissed);
  const acceptAutoplay = useAudioStore((s) => s.acceptAutoplay);
  const dismissAutoplay = useAudioStore((s) => s.dismissAutoplay);

  if (!autoplayRecommendation || autoplayCountdown === null || isAutoplayDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Upcoming autoplay recommendation"
      className="fixed bottom-24 right-4 sm:right-8 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-88 p-3.5 rounded-2xl bg-neutral-950/95 border border-neutral-700/80 backdrop-blur-xl transition-[opacity,transform]"
    >
      {/* Top status bar with countdown and dismiss action */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-800/80 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-neutral-200">
            Autoplaying next in <span className="text-amber-300 font-semibold">{autoplayCountdown}s</span>
          </span>
        </div>

        <button
          type="button"
          onClick={dismissAutoplay}
          aria-label="Cancel upcoming autoplay recommendation"
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recommended track details */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
          <Image
            src={autoplayRecommendation.thumbnailUrl || autoplayRecommendation.coverUrl}
            alt={autoplayRecommendation.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-neutral-100 truncate">
            {autoplayRecommendation.title}
          </h4>
          <p className="text-[11px] text-neutral-400 truncate">
            {autoplayRecommendation.artist}
          </p>
          <span className="text-[10px] text-neutral-500 font-sans block mt-0.5">
            Recommended from active playlist queue
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={dismissAutoplay}
          className="px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={acceptAutoplay}
          className="px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Play Now</span>
        </button>
      </div>
    </aside>
  );
}
