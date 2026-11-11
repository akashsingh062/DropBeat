"use client";

import { useState } from "react";
import { useAudioStore } from "@/lib/store";
import { Track } from "@/types/music";
import { Play, Pause, Plus, Search, Disc } from "lucide-react";
import Image from "next/image";

interface TrackGridProps {
  tracks: Track[];
}

export function TrackGrid({ tracks }: TrackGridProps) {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const addToQueue = useAudioStore((s) => s.addToQueue);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const genres = ["all", ...Array.from(new Set(tracks.map((t) => t.genre)))];

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || t.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, "0")}`;
  };

  return (
    <section aria-label="Audio Library Catalog" className="w-full space-y-6">
      {/* Search and Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, artist, or album..."
            aria-label="Search music catalog"
            className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:border-neutral-700 transition-colors"
          />
        </div>

        {/* Genre pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                selectedGenre === g
                  ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              {g === "all" ? "All genres" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Featured Tracks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
        {filteredTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          const isPlaying = isCurrent && playbackStatus === "playing";

          return (
            <div
              key={track.id}
              className={`group relative p-3.5 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 flex flex-col justify-between ${
                isCurrent
                  ? "bg-neutral-900/80 border-neutral-700 shadow-md"
                  : "bg-neutral-900/30 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700"
              }`}
            >
              <div>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/60">
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />

                  {/* Play trigger overlay */}
                  <div
                    className={`absolute inset-0 bg-neutral-950/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                      aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                      className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-neutral-50">
                      {track.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-500 shrink-0">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-sans">
                  {track.album}
                </span>

                <button
                  type="button"
                  onClick={() => addToQueue(track)}
                  aria-label={`Enqueue ${track.title}`}
                  className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                >
                  <Plus className="w-3 h-3" />
                  <span>Queue</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          <Disc className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
          <p className="text-sm">No tracks matched your query &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}
    </section>
  );
}
