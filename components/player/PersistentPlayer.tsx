"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import { useAudioStore } from "@/lib/store";
import { extractDominantColor, applyAmbientTheme } from "@/lib/ambient";
import { fetchLyricsFromLrclib } from "@/lib/lyrics";

export function PersistentPlayer() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const seekTarget = useAudioStore((s) => s.seekTarget);

  const setPlaybackStatus = useAudioStore((s) => s.setPlaybackStatus);
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const setDuration = useAudioStore((s) => s.setDuration);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const clearSeekTarget = useAudioStore((s) => s.clearSeekTarget);
  const setAmbientData = useAudioStore((s) => s.setAmbientData);
  const setLyrics = useAudioStore((s) => s.setLyrics);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ambient color and lyrics whenever track changes
  useEffect(() => {
    if (!currentTrack) return;

    let isMounted = true;

    // 1. Extract dominant color
    extractDominantColor(currentTrack.coverUrl).then((color) => {
      if (isMounted) {
        applyAmbientTheme(color);
        setAmbientData(color.rgb, color.glow);
      }
    });

    // 2. Fetch lyrics if needed
    if (!currentTrack.syncedLyrics || currentTrack.syncedLyrics.length === 0) {
      fetchLyricsFromLrclib(currentTrack.title, currentTrack.artist, currentTrack.duration).then((lrc) => {
        if (isMounted && lrc.length > 0) {
          setLyrics(lrc);
        }
      });
    } else {
      setLyrics(currentTrack.syncedLyrics);
    }

    return () => {
      isMounted = false;
    };
  }, [currentTrack, setAmbientData, setLyrics]);

  // Handle Play/Pause synchronization with YouTube player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady) return;

    try {
      if (playbackStatus === "playing") {
        player.playVideo();
      } else if (playbackStatus === "paused") {
        player.pauseVideo();
      }
    } catch {
      // player might be transitioning
    }
  }, [playbackStatus, isPlayerReady, currentTrack]);

  // Handle Volume & Mute
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady) return;

    try {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(volume);
      }
    } catch {
      // ignore
    }
  }, [volume, isMuted, isPlayerReady]);

  // Handle Seeking
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || seekTarget === null) return;

    try {
      player.seekTo(seekTarget, true);
      clearSeekTarget();
    } catch {
      // ignore
    }
  }, [seekTarget, isPlayerReady, clearSeekTarget]);

  // Time tracking interval
  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const time = await player.getCurrentTime();
        const dur = await player.getDuration();
        if (typeof time === "number" && !isNaN(time)) {
          setCurrentTime(time);
        }
        if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      } catch {
        // player might not be ready
      }
    }, 250);
  }, [setCurrentTime, setDuration]);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (playbackStatus === "playing") {
      startTimeTracking();
    } else {
      stopTimeTracking();
    }
    return () => stopTimeTracking();
  }, [playbackStatus, startTimeTracking, stopTimeTracking]);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
    try {
      event.target.setVolume(volume);
      if (isMuted) event.target.mute();
      if (playbackStatus === "playing") {
        event.target.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const onStateChange = (event: YouTubeEvent<number>) => {
    // YouTube player state values:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    const state = event.data;
    if (state === 1) {
      setPlaybackStatus("playing");
    } else if (state === 2) {
      setPlaybackStatus("paused");
    } else if (state === 3) {
      setPlaybackStatus("buffering");
    } else if (state === 0) {
      nextTrack();
    }
  };

  const onError = () => {
    // If playback error on this video, smoothly step to next
    nextTrack();
  };

  if (!currentTrack) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 right-0 pointer-events-none opacity-0 -z-50 w-px h-px overflow-hidden"
    >
      <YouTube
        videoId={currentTrack.youtubeId}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
        opts={{
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
        }}
      />
    </div>
  );
}

