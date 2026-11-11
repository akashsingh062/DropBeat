"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/store";
import { AppView } from "@/types/music";
import { Disc, Mic2, Activity, ListMusic, Radio, Search, X } from "lucide-react";

export function Header() {
  const activeView = useAudioStore((s) => s.activeView);
  const setActiveView = useAudioStore((s) => s.setActiveView);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const ambientRgb = useAudioStore((s) => s.ambientRgb);
  const globalSearchQuery = useAudioStore((s) => s.globalSearchQuery);
  const setGlobalSearchQuery = useAudioStore((s) => s.setGlobalSearchQuery);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isPlaying = playbackStatus === "playing";

  // Global "/" keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setActiveView("search");
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveView]);

  const navItems: Array<{ id: AppView; label: string; icon: typeof Disc }> = [
    { id: "library", label: "Catalog", icon: Disc },
    { id: "search", label: "Search", icon: Search },
    { id: "lyrics", label: "Lyrics", icon: Mic2 },
    { id: "visualizer", label: "Visualizer", icon: Activity },
    { id: "queue", label: "Queue", icon: ListMusic },
  ];

  const handlePillClick = () => {
    if (activeView === "lyrics" || activeView === "visualizer") {
      setActiveView("library");
    } else {
      setActiveView("lyrics");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView("search");
  };

  const handleClearSearch = () => {
    setGlobalSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-2xl border-b border-neutral-800/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 lg:gap-4">
        {/* Brand identity & Mobile Navigation on row 1 for mobile */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => setActiveView("library")}
          >
            <div
              className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center transition-shadow"
              style={{
                boxShadow: `0 0 15px rgba(${ambientRgb}, 0.3)`
              }}
            >
              <Radio className="w-4 h-4 text-neutral-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-neutral-100 leading-none">
                DropBeat
              </span>
              <span className="text-[10px] text-neutral-400 font-sans leading-tight mt-0.5">
                Atmospheric Audio Deck
              </span>
            </div>
          </div>

          {/* View switcher navigation on small screens */}
          <nav aria-label="Audio deck modes mobile" className="flex lg:hidden items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    if (item.id === "search") {
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 shrink-0 ${
                    isActive
                      ? "bg-neutral-800 text-neutral-100 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Omnipresent Search Bar - ALWAYS visible across all screen sizes */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full lg:flex-1 lg:max-w-md relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              if (activeView !== "search") {
                setActiveView("search");
              }
            }}
            onFocus={() => {
              if (activeView !== "search" && globalSearchQuery.trim()) {
                setActiveView("search");
              }
            }}
            placeholder="Search any song, artist, YouTube URL..."
            aria-label="Global YouTube audio search"
            className="w-full pl-9 pr-24 py-2 lg:py-1.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-300 focus-visible:border-neutral-500 transition-colors"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {globalSearchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700/80 bg-neutral-950 pointer-events-none">
              /
            </kbd>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              Search
            </button>
          </div>
        </form>

        {/* View switcher navigation on desktop */}
        <nav aria-label="Audio deck modes" className="hidden lg:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  if (item.id === "search") {
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 shrink-0 ${
                  isActive
                    ? "bg-neutral-800 text-neutral-100 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Interactive Active Track Pill (Desktop xl) */}
        <button
          type="button"
          onClick={handlePillClick}
          title={
            activeView === "lyrics" || activeView === "visualizer"
              ? "Return to Catalog"
              : "Toggle full-screen Lyrics stage"
          }
          className="hidden xl:flex items-center gap-3 bg-neutral-900/40 hover:bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800/80 hover:border-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 group shrink-0"
        >
          <div className="flex items-end gap-0.5 h-3">
            <span
              className={`w-0.5 bg-neutral-400 rounded-full ${
                isPlaying ? "animate-[bounce_0.8s_ease-in-out_infinite]" : "h-1"
              }`}
            />
            <span
              className={`w-0.5 bg-neutral-300 rounded-full ${
                isPlaying ? "animate-[bounce_1.2s_ease-in-out_infinite_0.2s]" : "h-2"
              }`}
            />
            <span
              className={`w-0.5 bg-neutral-200 rounded-full ${
                isPlaying ? "animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" : "h-1.5"
              }`}
            />
          </div>
          <span className="text-xs text-neutral-400 group-hover:text-neutral-200 max-w-[140px] truncate font-sans">
            {currentTrack?.title || "No track active"}
          </span>
        </button>
      </div>
    </header>
  );
}
