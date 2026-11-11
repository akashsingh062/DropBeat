"use client";

import { useAudioStore } from "@/lib/store";
import { YOUTUBE_PLAYLISTS } from "@/data/playlists";
import { Play, Disc3, Radio } from "lucide-react";
import Image from "next/image";

export function PlaylistSelector() {
  const activePlaylistId = useAudioStore((s) => s.activePlaylistId);
  const selectPlaylist = useAudioStore((s) => s.selectPlaylist);
  const playPlaylist = useAudioStore((s) => s.playPlaylist);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);

  return (
    <section aria-label="Curated YouTube Playlists" className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-neutral-400" />
          <h3 className="text-base font-semibold text-neutral-100">
            Curated YouTube Playlists
          </h3>
        </div>
        <span className="text-xs text-neutral-400 font-sans">
          {YOUTUBE_PLAYLISTS.length} curated stations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))]">
        {YOUTUBE_PLAYLISTS.map((playlist) => {
          const isActive = activePlaylistId === playlist.id;
          const isPlayingThis = isActive && playbackStatus === "playing";

          return (
            <div
              key={playlist.id}
              onClick={() => selectPlaylist(playlist.id)}
              className={`group cursor-pointer p-3.5 rounded-2xl border transition-[background-color,border-color,box-shadow] duration-200 flex flex-col justify-between ${
                isActive
                  ? "bg-neutral-900/90 border-neutral-600 shadow-lg"
                  : "bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/70 hover:border-neutral-700"
              }`}
            >
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/60">
                  <Image
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playPlaylist(playlist.id);
                      }}
                      aria-label={`Play ${playlist.title}`}
                      className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/80 text-[10px] font-medium text-neutral-300 border border-neutral-800/60 backdrop-blur-md">
                    {playlist.tracks.length} tracks
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                  <Radio className="w-3 h-3 text-neutral-500" />
                  <span>{playlist.category}</span>
                </div>

                <h4 className="text-sm font-semibold text-neutral-100 leading-snug group-hover:text-neutral-50">
                  {playlist.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {playlist.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  {playlist.curator}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPlaylist(playlist.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
                    isPlayingThis
                      ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isPlayingThis ? "Playing" : "Play Playlist"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

