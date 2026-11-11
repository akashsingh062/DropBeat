export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

const lyricsCache = new Map<string, SyncedLyricLine[]>();

export function parseLrc(lrcText: string): SyncedLyricLine[] {
  const lines = lrcText.split("\n");
  const result: SyncedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      if (text) {
        result.push({ time: timeInSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export async function fetchLyricsFromLrclib(
  trackName: string,
  artistName: string,
  duration?: number
): Promise<SyncedLyricLine[]> {
  const cacheKey = `${trackName.toLowerCase()}::${artistName.toLowerCase()}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  try {
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });
    if (duration) {
      params.append("duration", Math.round(duration).toString());
    }

    const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: {
        "User-Agent": "DropBeat Audio Client (https://github.com/Nutlope/hallmark)",
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (data.syncedLyrics) {
      const parsed = parseLrc(data.syncedLyrics);
      lyricsCache.set(cacheKey, parsed);
      return parsed;
    }

    if (data.plainLyrics) {
      // Fallback: distribute lines roughly across track length
      const lines = data.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
      const totalSec = duration || 180;
      const interval = totalSec / Math.max(1, lines.length);
      const parsed: SyncedLyricLine[] = lines.map((text: string, idx: number) => ({
        time: idx * interval,
        text: text.trim()
      }));
      lyricsCache.set(cacheKey, parsed);
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

