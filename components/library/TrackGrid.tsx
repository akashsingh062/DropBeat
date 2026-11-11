"use client";

import { useState, useEffect } from "react";
import { useAudioStore } from "@/lib/store";
import { Track } from "@/types/music";
import { Play, Pause, Plus, Search, Disc, Zap, Link2, Loader2, Video, Check } from "lucide-react";
import Image from "next/image";
import { UrlImporterModal } from "@/components/search/UrlImporterModal";

interface TrackGridProps {
  tracks: Track[];
}

export function TrackGrid({ tracks }: TrackGridProps) {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const playTrack = useAudioStore((s) => s.playTrack);
  const playTrackAtDrop = useAudioStore((s) => s.playTrackAtDrop);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const globalSearchQuery = useAudioStore((s) => s.globalSearchQuery);
  const setGlobalSearchQuery = useAudioStore((s) => s.setGlobalSearchQuery);

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");
  const [debouncedQuery, setDebouncedQuery] = useState(globalSearchQuery || "");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [queuedTrackId, setQueuedTrackId] = useState<string | null>(null);

  // Global YouTube search results
  const [ytResults, setYtResults] = useState<Track[]>([]);
  const [isYtLoading, setIsYtLoading] = useState(false);

  // Sync with globalSearchQuery if changed from header
  useEffect(() => {
    if (globalSearchQuery !== searchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // 350ms debounce for live search query
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedQuery(trimmed);
      setGlobalSearchQuery(trimmed);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery, setGlobalSearchQuery]);

  // Query YouTube API route when debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setYtResults([]);
      setIsYtLoading(false);
      return;
    }

    let isCancelled = false;
    setIsYtLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => {
        if (!isCancelled) {
          setYtResults(data.results || []);
          setIsYtLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setYtResults([]);
          setIsYtLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const handleQueueClick = (track: Track) => {
    addToQueue(track);
    setQueuedTrackId(track.id);
    setTimeout(() => {
      setQueuedTrackId(null);
    }, 1200);
  };

  const genres = ["all", ...Array.from(new Set(tracks.map((t) => t.genre)))];

  const filteredCuratedTracks = tracks.filter((t) => {
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
    <section aria-label="Audio Library Catalog" className="w-full space-y-8">
      {/* Prominent Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl">
        {/* Search input with 350ms debounce */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song, artist, remix on YouTube (e.g. Coldplay, Daft Punk, Lofi)..."
            aria-label="Search catalog and YouTube"
            className="w-full pl-10 pr-9 py-3 bg-neutral-950/80 border border-neutral-700/80 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 transition-colors"
          />
          {isYtLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
          )}
        </div>

        {/* Quick action: Paste YouTube link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            <Link2 className="w-3.5 h-3.5 text-neutral-300" />
            <span>+ Paste YouTube Link</span>
          </button>
        </div>
      </div>

      {/* Genre filter pills (shown when not searching) */}
      {!debouncedQuery && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                selectedGenre === g
                  ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              {g === "all" ? "All genres" : g}
            </button>
          ))}
        </div>
      )}

      {/* GLOBAL YOUTUBE SEARCH RESULTS - Displayed FIRST when searching */}
      {debouncedQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-neutral-300" />
              <h3 className="text-base font-semibold text-neutral-100">
                YouTube Streams for &ldquo;{debouncedQuery}&rdquo;
              </h3>
            </div>
            {isYtLoading ? (
              <span className="text-xs text-neutral-400 font-sans flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Searching YouTube…</span>
              </span>
            ) : (
              <span className="text-xs text-neutral-400 font-sans">
                {ytResults.length} stream{ytResults.length === 1 ? "" : "s"} found
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
            {ytResults.map((ytTrack) => {
              const isCurrent = currentTrack?.id === ytTrack.id;
              const isPlaying = isCurrent && playbackStatus === "playing";
              const isJustQueued = queuedTrackId === ytTrack.id;

              return (
                <div
                  key={ytTrack.id}
                  className={`group relative p-3.5 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 flex flex-col justify-between ${
                    isCurrent
                      ? "bg-neutral-900/90 border-neutral-600 shadow-md"
                      : "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/70 hover:border-neutral-700"
                  }`}
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/60">
                      <Image
                        src={ytTrack.thumbnailUrl || ytTrack.coverUrl}
                        alt={ytTrack.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />

                      {/* Play trigger overlay - accessible on mobile & desktop */}
                      <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => (isCurrent ? togglePlay() : playTrack(ytTrack))}
                          aria-label={isPlaying ? `Pause ${ytTrack.title}` : `Play ${ytTrack.title}`}
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
                          {ytTrack.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">
                          {ytTrack.artist}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 shrink-0">
                        {formatDuration(ytTrack.duration)}
                      </span>
                    </div>
                  </div>

                  {/* 3 Explicit Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1.5">
                    {/* Play Now Button */}
                    <button
                      type="button"
                      onClick={() => playTrack(ytTrack)}
                      aria-label={`Play ${ytTrack.title} now`}
                      className="px-2.5 py-1.5 text-xs text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded-md font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>

                    {/* Play Drop Button */}
                    <button
                      type="button"
                      onClick={() => playTrackAtDrop(ytTrack)}
                      aria-label={`Play drop point for ${ytTrack.title}`}
                      className="px-2 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Drop</span>
                    </button>

                    {/* Add to Queue Button */}
                    <button
                      type="button"
                      onClick={() => handleQueueClick(ytTrack)}
                      aria-label={`Add ${ytTrack.title} to queue`}
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

          {!isYtLoading && ytResults.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No matching YouTube recordings found for &ldquo;{debouncedQuery}&rdquo;. Try another song or artist name.
            </div>
          )}
        </div>
      )}

      {/* Curated Tracks Section */}
      <div className={`space-y-4 ${debouncedQuery ? "pt-6 border-t border-neutral-800" : ""}`}>
        <div className="flex items-center justify-between pb-1 border-b border-neutral-800/80">
          <span className="text-sm font-semibold text-neutral-300">
            {debouncedQuery ? "Curated Catalog Matches" : "Curated Master Recordings"}
          </span>
          <span className="text-xs text-neutral-500 font-sans">
            {filteredCuratedTracks.length} track{filteredCuratedTracks.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
          {filteredCuratedTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isPlaying = isCurrent && playbackStatus === "playing";
            const isJustQueued = queuedTrackId === track.id;

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

                <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-1.5">
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
                    aria-label={`Play drop point for ${track.title}`}
                    className="px-2 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Drop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQueueClick(track)}
                    aria-label={`Enqueue ${track.title}`}
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

        {filteredCuratedTracks.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            <Disc className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
            <p className="text-sm">No curated catalog tracks match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* URL Importer Modal */}
      <UrlImporterModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
      />
    </section>
  );
}
