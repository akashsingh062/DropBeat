"use client";

import { useState } from "react";
import { useAudioStore } from "@/lib/store";
import { Track } from "@/types/music";
import { X, Link2, Loader2, Play, Plus, Check } from "lucide-react";
import Image from "next/image";

interface UrlImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UrlImporterModal({ isOpen, onClose }: UrlImporterModalProps) {
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const playTrack = useAudioStore((s) => s.playTrack);

  const [inputUrl, setInputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedTrack, setFetchedTrack] = useState<Track | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const extractYouTubeId = (url: string): string | null => {
    const trimmed = url.trim();
    // Match 11 character standalone ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    // Match standard URLs
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regex);
    return match ? match[1] : null;
  };

  const handleFetchMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFetchedTrack(null);
    setIsSuccess(false);

    const videoId = extractYouTubeId(inputUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube video link or 11-character video ID.");
      return;
    }

    setIsLoading(true);

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);
      if (!res.ok) {
        throw new Error("Could not fetch YouTube video information.");
      }

      const data = await res.json();
      const track: Track = {
        id: videoId,
        title: data.title || "Imported YouTube Audio",
        artist: data.author_name || "YouTube Creator",
        album: `${data.author_name || "YouTube"} (Single)`,
        duration: 210,
        thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        coverUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        youtubeId: videoId,
        genre: "Imported Stream",
        peakTimestamp: 70,
      };

      setFetchedTrack(track);
    } catch {
      // Fallback with minimal track data
      const track: Track = {
        id: videoId,
        title: `YouTube Video (${videoId})`,
        artist: "YouTube Stream",
        album: "Direct Import",
        duration: 210,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        youtubeId: videoId,
        genre: "Imported Stream",
        peakTimestamp: 70,
      };
      setFetchedTrack(track);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToQueue = () => {
    if (!fetchedTrack) return;
    addToQueue(fetchedTrack);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setInputUrl("");
      setFetchedTrack(null);
      setIsSuccess(false);
    }, 800);
  };

  const handlePlayNow = () => {
    if (!fetchedTrack) return;
    playTrack(fetchedTrack);
    onClose();
    setInputUrl("");
    setFetchedTrack(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Import YouTube Link"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-200">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Import YouTube Audio
              </h3>
              <p className="text-xs text-neutral-400">
                Paste any YouTube URL or video ID to queue or play
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFetchMetadata} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="yt-url-input" className="text-xs font-medium text-neutral-300">
              YouTube Video Link
            </label>
            <div className="flex gap-2">
              <input
                id="yt-url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-950 font-medium text-xs hover:bg-neutral-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 shrink-0 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resolving</span>
                  </>
                ) : (
                  <span>Resolve</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded-lg border border-red-900/60">
              {error}
            </p>
          )}
        </form>

        {/* Fetched Result Card */}
        {fetchedTrack && (
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                <Image
                  src={fetchedTrack.thumbnailUrl || fetchedTrack.coverUrl}
                  alt={fetchedTrack.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-neutral-100 truncate">
                  {fetchedTrack.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">
                  {fetchedTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={handleAddToQueue}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 whitespace-nowrap"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Added to Queue</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Queue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePlayNow}
                className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-950 text-xs font-medium flex items-center gap-1.5 transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
