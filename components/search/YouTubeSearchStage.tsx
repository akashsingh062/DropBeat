"use client";

import { useState, useEffect } from "react";
import { useAudioStore } from "@/lib/store";
import { Track } from "@/types/music";
import { Search, Play, Pause, Plus, Loader2, Video, Zap, Link2, Check } from "lucide-react";
import Image from "next/image";
import { UrlImporterModal } from "@/components/search/UrlImporterModal";

export function YouTubeSearchStage() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const playTrack = useAudioStore((s) => s.playTrack);
  const playTrackAtDrop = useAudioStore((s) => s.playTrackAtDrop);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const globalSearchQuery = useAudioStore((s) => s.globalSearchQuery);
  const setGlobalSearchQuery = useAudioStore((s) => s.setGlobalSearchQuery);

  const [query, setQuery] = useState(globalSearchQuery || "");
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [queuedTrackId, setQueuedTrackId] = useState<string | null>(null);

  // Sync internal query with global search query
  useEffect(() => {
    if (globalSearchQuery !== query) {
      setQuery(globalSearchQuery);
      if (globalSearchQuery.trim()) {
        handleSearch(globalSearchQuery);
      }
    }
  }, [globalSearchQuery]);

  const popularSearches = [
    "Daft Punk Around The World",
    "Coldplay Hymn For The Weekend",
    "Lofi hip hop radio",
    "Hans Zimmer Time",
    "Tame Impala The Less I Know The Better",
    "Synthwave sunset drive",
    "Radiohead Weird Fishes"
  ];

  const handleSearch = async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (!term) return;

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) {
        throw new Error("Search request failed");
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setErrorMessage("Could not load search results from YouTube. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueClick = (track: Track) => {
    addToQueue(track);
    setQueuedTrackId(track.id);
    setTimeout(() => {
      setQueuedTrackId(null);
    }, 1200);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSearchQuery(query);
    handleSearch(query);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Video className="w-4 h-4 text-neutral-300" />
              <span>YouTube Audio Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 tracking-tight">
              Search any song across YouTube
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Stream full audio recordings, live performances, and ambient tracks with real-time waveform visualizer and synced lyrics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 shrink-0"
          >
            <Link2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>+ Paste YouTube Link</span>
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={onSubmit} className="relative flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by song title, artist, remix, or live version..."
              aria-label="Search YouTube tracks"
              className="w-full pl-10 pr-4 py-3 bg-neutral-950/70 border border-neutral-700/80 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-sm hover:bg-neutral-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 shrink-0 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>

        {/* Quick query chips */}
        <div className="space-y-2">
          <span className="text-[11px] text-neutral-400 block">
            Suggested search ideas
          </span>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  setGlobalSearchQuery(item);
                  handleSearch(item);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-300 text-center">
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-center text-neutral-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
          <p className="text-sm">Querying YouTube audio stream index…</p>
        </div>
      )}

      {/* Results grid */}
      {!isLoading && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <span className="text-sm font-semibold text-neutral-100">
              Search Results
            </span>
            <span className="text-xs text-neutral-400 font-sans">
              {results.length} matches from YouTube
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlaying = isCurrent && playbackStatus === "playing";
              const isJustQueued = queuedTrackId === track.id;

              return (
                <div
                  key={track.id}
                  className={`group relative p-3.5 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 flex flex-col justify-between ${
                    isCurrent
                      ? "bg-neutral-900/90 border-neutral-600 shadow-md"
                      : "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/70 hover:border-neutral-700"
                  }`}
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/60">
                      <Image
                        src={track.thumbnailUrl || track.coverUrl}
                        alt={track.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />

                      {/* Play trigger overlay */}
                      <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                          aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                          className="w-11 h-11 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
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
                        <h4 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-neutral-50">
                          {track.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 shrink-0">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>

                  {/* 3 Explicit Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => playTrack(track)}
                      aria-label={`Play ${track.title} now`}
                      className="px-2.5 py-1.5 text-xs text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded-md font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => playTrackAtDrop(track)}
                      aria-label={`Play hook drop for ${track.title}`}
                      className="px-2 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Drop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQueueClick(track)}
                      aria-label={`Add ${track.title} to queue`}
                      className={`px-2.5 py-1.5 text-xs rounded-md flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                        isJustQueued
                          ? "bg-emerald-950/60 border border-emerald-500/60 text-emerald-300"
                          : "text-neutral-300 hover:text-neutral-100 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60"
                      }`}
                    >
                      {isJustQueued ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Queued</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty result state */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="py-20 text-center text-neutral-500">
          <Video className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No YouTube videos found matching &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* URL Importer Modal */}
      <UrlImporterModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
      />
    </div>
  );
}
