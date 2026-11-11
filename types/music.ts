export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  thumbnailUrl?: string;
  youtubeId: string;
  genre: string;
  year?: number;
  bpm?: number;
  peakTimestamp?: number; // timestamp in seconds where the beat/hook drops
  syncedLyrics?: Array<{ time: number; text: string }>;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'buffering' | 'ended';

export type RepeatMode = 'off' | 'all' | 'one';

export type AppView = 'library' | 'search' | 'queue' | 'lyrics' | 'visualizer';
