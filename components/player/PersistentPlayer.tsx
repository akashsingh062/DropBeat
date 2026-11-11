"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import { useAudioStore } from "@/lib/store";
import { extractDominantColor, applyAmbientTheme } from "@/lib/ambient";
import { fetchLyricsFromLrclib } from "@/lib/lyrics";
import { Track } from "@/types/music";

export function PersistentPlayer() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackStatus = useAudioStore((s) => s.playbackStatus);
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const seekTarget = useAudioStore((s) => s.seekTarget);
  const isHookMode = useAudioStore((s) => s.isHookMode);
  const hookDuration = useAudioStore((s) => s.hookDuration);
  const queue = useAudioStore((s) => s.queue);
  const queueIndex = useAudioStore((s) => s.queueIndex);
  const autoplayRecommendation = useAudioStore((s) => s.autoplayRecommendation);
  const isAutoplayDismissed = useAudioStore((s) => s.isAutoplayDismissed);

  const setPlaybackStatus = useAudioStore((s) => s.setPlaybackStatus);
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const setDuration = useAudioStore((s) => s.setDuration);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const nextTrackDrop = useAudioStore((s) => s.nextTrackDrop);
  const clearSeekTarget = useAudioStore((s) => s.clearSeekTarget);
  const setAmbientData = useAudioStore((s) => s.setAmbientData);
  const setLyrics = useAudioStore((s) => s.setLyrics);
  const setAutoplayRecommendation = useAudioStore((s) => s.setAutoplayRecommendation);
  const setAutoplayCountdown = useAudioStore((s) => s.setAutoplayCountdown);
  const playTrack = useAudioStore((s) => s.playTrack);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredHookSkip = useRef(false);
  const isFetchingRecommendation = useRef(false);
  const hasTriggeredAutoplayEnd = useRef(false);

  // Reset guards whenever current track changes
  useEffect(() => {
    hasTriggeredHookSkip.current = false;
    isFetchingRecommendation.current = false;
    hasTriggeredAutoplayEnd.current = false;
    setAutoplayCountdown(null);
  }, [currentTrack, setAutoplayCountdown]);

  // Sync ambient color and lyrics whenever track changes
  useEffect(() => {
    if (!currentTrack) return;

    let isMounted = true;

    // 1. Extract dominant color
    extractDominantColor(currentTrack.coverUrl || currentTrack.thumbnailUrl || "").then((color) => {
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
      } else if (playbackStatus === "paused" || playbackStatus === "idle") {
        player.pauseVideo();
      }
    } catch {
      // player transitioning
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

  // Time tracking and Autoplay recommendation monitoring
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

          // Hook / Drop Mode auto-advance check
          if (isHookMode && currentTrack) {
            const dropPoint = currentTrack.peakTimestamp || Math.floor((currentTrack.duration || 200) * 0.35);
            if (time >= dropPoint + hookDuration && !hasTriggeredHookSkip.current) {
              hasTriggeredHookSkip.current = true;
              nextTrackDrop();
              return;
            }
          }

          // Autoplay recommendation check when song is about to end (<= 15 seconds remaining)
          if (dur > 20 && !isAutoplayDismissed) {
            const remaining = dur - time;

            if (remaining <= 15 && remaining > 0) {
              setAutoplayCountdown(Math.ceil(remaining));

              // Resolve recommendation if not already set
              if (!autoplayRecommendation && !isFetchingRecommendation.current) {
                // Check if queue has a next track
                if (queueIndex + 1 < queue.length) {
                  setAutoplayRecommendation(queue[queueIndex + 1]);
                } else if (currentTrack) {
                  // Fetch dynamic YouTube recommendation
                  isFetchingRecommendation.current = true;
                  fetch(
                    `/api/recommendations?artist=${encodeURIComponent(currentTrack.artist)}&title=${encodeURIComponent(currentTrack.title)}&genre=${encodeURIComponent(currentTrack.genre)}&excludeId=${currentTrack.youtubeId}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.recommendations && data.recommendations.length > 0) {
                        setAutoplayRecommendation(data.recommendations[0]);
                      }
                    })
                    .catch(() => {
                      // fallback to looping to queue[0]
                      if (queue.length > 0) {
                        setAutoplayRecommendation(queue[0]);
                      }
                    });
                }
              }

              // Auto-advance if remaining time hits end
              if (remaining <= 1 && !hasTriggeredAutoplayEnd.current) {
                hasTriggeredAutoplayEnd.current = true;
                if (autoplayRecommendation) {
                  playTrack(autoplayRecommendation);
                } else {
                  nextTrack();
                }
              }
            } else if (remaining > 15) {
              setAutoplayCountdown(null);
            }
          }
        }
        if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      } catch {
        // player might not be ready
      }
    }, 250);
  }, [
    setCurrentTime,
    setDuration,
    isHookMode,
    currentTrack,
    hookDuration,
    nextTrackDrop,
    isAutoplayDismissed,
    queue,
    queueIndex,
    autoplayRecommendation,
    setAutoplayCountdown,
    setAutoplayRecommendation,
    nextTrack,
    playTrack
  ]);

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

      // STRICT CHECK: DO NOT PLAY INITIALLY UNLESS USER EXPLICITLY INITIATES PLAY
      if (playbackStatus === "playing") {
        event.target.playVideo();
      } else {
        event.target.pauseVideo();
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
      // If autoplay recommendation exists and wasn't dismissed, automatically play it
      if (!isAutoplayDismissed && autoplayRecommendation) {
        playTrack(autoplayRecommendation);
      } else if (isHookMode) {
        nextTrackDrop();
      } else {
        nextTrack();
      }
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
            autoplay: 0, // Explicitly 0: never autoplay on mount
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
