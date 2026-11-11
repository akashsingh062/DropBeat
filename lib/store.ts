import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Track, Playlist, PlaybackStatus, RepeatMode, AppView } from "@/types/music";
import { YOUTUBE_PLAYLISTS } from "@/data/playlists";
import { SyncedLyricLine } from "@/lib/lyrics";

interface AudioStoreState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  playbackStatus: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 100
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  activeView: AppView;
  ambientRgb: string;
  ambientGlow: string;
  lyrics: SyncedLyricLine[];
  seekTarget: number | null;
  isHookMode: boolean;
  hookDuration: number; // in seconds (default: 25)
  globalSearchQuery: string;

  // Playlists
  playlists: Playlist[];
  activePlaylistId: string;

  // Autoplay Recommendations
  autoplayRecommendation: Track | null;
  autoplayCountdown: number | null;
  isAutoplayDismissed: boolean;

  // Actions
  playTrack: (track: Track) => void;
  playTrackAtDrop: (track: Track) => void;
  jumpToDrop: () => void;
  toggleHookMode: () => void;
  togglePlay: () => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  nextTrackDrop: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  clearSeekTarget: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setActiveView: (view: AppView) => void;
  setAmbientData: (rgb: string, glow: string) => void;
  setLyrics: (lyrics: SyncedLyricLine[]) => void;
  setGlobalSearchQuery: (query: string) => void;

  // Playlist Actions
  selectPlaylist: (playlistId: string) => void;
  playPlaylist: (playlistId: string) => void;

  // Autoplay Actions
  setAutoplayRecommendation: (track: Track | null) => void;
  setAutoplayCountdown: (countdown: number | null) => void;
  dismissAutoplay: () => void;
  acceptAutoplay: () => void;
}

const defaultPlaylist = YOUTUBE_PLAYLISTS[0];
const defaultTrack = defaultPlaylist.tracks[0];

export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set, get) => ({
      currentTrack: defaultTrack,
      queue: defaultPlaylist.tracks,
      queueIndex: 0,
      playbackStatus: "idle", // Never start playing automatically
      currentTime: 0,
      duration: defaultTrack.duration || 327,
      volume: 80,
      isMuted: false,
      isShuffle: false,
      repeatMode: "all",
      activeView: "library",
      ambientRgb: "24, 24, 27",
      ambientGlow: "rgba(24, 24, 27, 0.25)",
      lyrics: defaultTrack.syncedLyrics || [],
      seekTarget: null,
      isHookMode: false,
      hookDuration: 25,
      globalSearchQuery: "",

      // Playlists
      playlists: YOUTUBE_PLAYLISTS,
      activePlaylistId: defaultPlaylist.id,

      // Autoplay Recommendations
      autoplayRecommendation: null,
      autoplayCountdown: null,
      isAutoplayDismissed: false,

      playTrack: (track) => {
        const { queue } = get();
        const existingIdx = queue.findIndex((t) => t.id === track.id);
        if (existingIdx !== -1) {
          set({
            currentTrack: track,
            queueIndex: existingIdx,
            playbackStatus: "playing",
            currentTime: 0,
            duration: track.duration,
            lyrics: track.syncedLyrics || [],
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
        } else {
          set({
            currentTrack: track,
            queue: [...queue, track],
            queueIndex: queue.length,
            playbackStatus: "playing",
            currentTime: 0,
            duration: track.duration,
            lyrics: track.syncedLyrics || [],
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
        }
      },

      playTrackAtDrop: (track) => {
        const { playTrack, seekTo } = get();
        playTrack(track);
        const dropPoint = track.peakTimestamp || Math.floor((track.duration || 200) * 0.35);
        seekTo(dropPoint);
      },

      jumpToDrop: () => {
        const { currentTrack, seekTo } = get();
        if (!currentTrack) return;
        const dropPoint = currentTrack.peakTimestamp || Math.floor((currentTrack.duration || 200) * 0.35);
        seekTo(dropPoint);
        set({ playbackStatus: "playing" });
      },

      toggleHookMode: () => {
        const { isHookMode, jumpToDrop, playbackStatus } = get();
        const nextMode = !isHookMode;
        set({ isHookMode: nextMode });
        if (nextMode && playbackStatus === "playing") {
          jumpToDrop();
        }
      },

      togglePlay: () => {
        const { playbackStatus, currentTrack, queue } = get();
        if (!currentTrack && queue.length > 0) {
          set({ currentTrack: queue[0], queueIndex: 0, playbackStatus: "playing" });
          return;
        }
        if (playbackStatus === "playing") {
          set({ playbackStatus: "paused" });
        } else {
          set({ playbackStatus: "playing" });
        }
      },

      setPlaybackStatus: (playbackStatus) => set({ playbackStatus }),

      setCurrentTime: (currentTime) => set({ currentTime }),

      setDuration: (duration) => set({ duration }),

      nextTrack: () => {
        const { queue, queueIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0) return;

        if (repeatMode === "one") {
          set({
            currentTime: 0,
            seekTarget: 0,
            playbackStatus: "playing",
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
          return;
        }

        let nextIdx = queueIndex + 1;
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * queue.length);
        } else if (nextIdx >= queue.length) {
          if (repeatMode === "all") {
            nextIdx = 0;
          } else {
            set({
              playbackStatus: "ended",
              autoplayRecommendation: null,
              autoplayCountdown: null
            });
            return;
          }
        }

        const nextT = queue[nextIdx];
        if (nextT) {
          set({
            currentTrack: nextT,
            queueIndex: nextIdx,
            playbackStatus: "playing",
            currentTime: 0,
            duration: nextT.duration,
            lyrics: nextT.syncedLyrics || [],
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
        }
      },

      nextTrackDrop: () => {
        const { queue, queueIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0) return;

        let nextIdx = queueIndex + 1;
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * queue.length);
        } else if (nextIdx >= queue.length) {
          if (repeatMode === "all") {
            nextIdx = 0;
          } else {
            set({ playbackStatus: "ended" });
            return;
          }
        }

        const nextT = queue[nextIdx];
        if (nextT) {
          const dropTime = nextT.peakTimestamp || Math.floor((nextT.duration || 200) * 0.35);
          set({
            currentTrack: nextT,
            queueIndex: nextIdx,
            playbackStatus: "playing",
            currentTime: dropTime,
            seekTarget: dropTime,
            duration: nextT.duration,
            lyrics: nextT.syncedLyrics || [],
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
        }
      },

      prevTrack: () => {
        const { queue, queueIndex, currentTime } = get();
        if (queue.length === 0) return;

        if (currentTime > 3) {
          set({ currentTime: 0, seekTarget: 0 });
          return;
        }

        const prevIdx = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
        const prevT = queue[prevIdx];
        if (prevT) {
          set({
            currentTrack: prevT,
            queueIndex: prevIdx,
            playbackStatus: "playing",
            currentTime: 0,
            duration: prevT.duration,
            lyrics: prevT.syncedLyrics || [],
            autoplayRecommendation: null,
            autoplayCountdown: null,
            isAutoplayDismissed: false
          });
        }
      },

      seekTo: (seconds) => {
        set({ seekTarget: seconds, currentTime: seconds });
      },

      clearSeekTarget: () => set({ seekTarget: null }),

      setVolume: (volume) => {
        set({ volume: Math.max(0, Math.min(100, volume)), isMuted: volume === 0 });
      },

      toggleMute: () => {
        const { isMuted } = get();
        set({ isMuted: !isMuted });
      },

      toggleShuffle: () => {
        const { isShuffle } = get();
        set({ isShuffle: !isShuffle });
      },

      cycleRepeat: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIdx] });
      },

      addToQueue: (track) => {
        set((state) => ({ queue: [...state.queue, track] }));
      },

      removeFromQueue: (index) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newIndex = state.queueIndex;
          if (index < state.queueIndex) {
            newIndex--;
          } else if (index === state.queueIndex) {
            newIndex = Math.min(newIndex, newQueue.length - 1);
          }
          return {
            queue: newQueue,
            queueIndex: Math.max(0, newIndex),
            currentTrack: newQueue[newIndex] || null
          };
        });
      },

      clearQueue: () => {
        const { currentTrack } = get();
        set({ queue: currentTrack ? [currentTrack] : [], queueIndex: 0 });
      },

      setActiveView: (activeView) => set({ activeView }),

      setAmbientData: (ambientRgb, ambientGlow) => set({ ambientRgb, ambientGlow }),

      setLyrics: (lyrics) => set({ lyrics }),

      setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),

      // Playlist Actions
      selectPlaylist: (playlistId) => {
        set({ activePlaylistId: playlistId });
      },

      playPlaylist: (playlistId) => {
        const { playlists } = get();
        const target = playlists.find((p) => p.id === playlistId);
        if (!target || target.tracks.length === 0) return;

        const firstTrack = target.tracks[0];
        set({
          activePlaylistId: playlistId,
          queue: target.tracks,
          queueIndex: 0,
          currentTrack: firstTrack,
          playbackStatus: "playing",
          currentTime: 0,
          duration: firstTrack.duration,
          lyrics: firstTrack.syncedLyrics || [],
          autoplayRecommendation: null,
          autoplayCountdown: null,
          isAutoplayDismissed: false
        });
      },

      // Autoplay Actions
      setAutoplayRecommendation: (autoplayRecommendation) => set({ autoplayRecommendation }),

      setAutoplayCountdown: (autoplayCountdown) => set({ autoplayCountdown }),

      dismissAutoplay: () => set({
        isAutoplayDismissed: true,
        autoplayRecommendation: null,
        autoplayCountdown: null
      }),

      acceptAutoplay: () => {
        const { autoplayRecommendation, playTrack } = get();
        if (autoplayRecommendation) {
          playTrack(autoplayRecommendation);
        }
      }
    }),
    {
      name: "dropbeat-audio-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        activeView: state.activeView,
        isHookMode: state.isHookMode
      })
    }
  )
);

if (typeof window !== "undefined") {
  (window as unknown as { __DROPBEAT_STORE__: typeof useAudioStore }).__DROPBEAT_STORE__ = useAudioStore;
}
