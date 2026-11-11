"use client";

import { useAudioStore } from "@/lib/store";
import { Track } from "@/types/music";
import { Play, Trash2, X, Music } from "lucide-react";
import Image from "next/image";

export function QueueDrawer() {
  const queue = useAudioStore((s) => s.queue);
  const queueIndex = useAudioStore((s) => s.queueIndex);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playTrack = useAudioStore((s) => s.playTrack);
  const removeFromQueue = useAudioStore((s) => s.removeFromQueue);
  const clearQueue = useAudioStore((s) => s.clearQueue);
  const setActiveView = useAudioStore((s) => s.setActiveView);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4 px-2">
        <div>
          <h2 className="text-sm font-medium text-neutral-100">Live Playback Queue</h2>
          <p className="text-xs text-neutral-500">
            {queue.length} track{queue.length === 1 ? "" : "s"} scheduled
          </p>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              type="button"
              onClick={clearQueue}
              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded border border-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              Clear upcoming
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveView("library")}
            aria-label="Close queue view"
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500 min-h-[300px]">
          <Music className="w-8 h-8 mb-2 text-neutral-600" />
          <p className="text-sm">The queue is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-[550px] pr-1">
          {queue.map((track: Track, idx: number) => {
            const isCurrent = currentTrack?.id === track.id && queueIndex === idx;

            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                  isCurrent
                    ? "bg-neutral-900/90 border border-neutral-800 text-neutral-100"
                    : "hover:bg-neutral-900/40 text-neutral-300"
                }`}
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => playTrack(track)}
                >
                  <span className="text-xs font-mono text-neutral-500 w-5 text-right shrink-0">
                    {idx + 1}
                  </span>

                  <div className="relative w-10 h-10 rounded overflow-hidden bg-neutral-900 shrink-0">
                    <Image
                      src={track.coverUrl}
                      alt={track.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-current text-neutral-100" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm truncate ${
                        isCurrent ? "font-medium text-neutral-100" : "text-neutral-300"
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">
                      {track.artist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs font-mono text-neutral-500">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(idx)}
                    aria-label={`Remove ${track.title} from queue`}
                    className="p-1 rounded text-neutral-500 hover:text-neutral-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

