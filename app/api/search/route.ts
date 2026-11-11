import { NextRequest, NextResponse } from "next/server";
import yts, { VideoSearchResult } from "yt-search";
import { Track } from "@/types/music";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchResults = await yts(query);
    const videos = (searchResults.videos || []).slice(0, 15);

    const tracks: Track[] = videos.map((video: VideoSearchResult) => {
      // Clean up common YouTube video title clutter
      let cleanTitle = video.title
        .replace(/\(Official (Music )?Video\)/gi, "")
        .replace(/\[Official (Music )?Video\]/gi, "")
        .replace(/\(Official Audio\)/gi, "")
        .replace(/\[Official Audio\]/gi, "")
        .replace(/\(Audio\)/gi, "")
        .replace(/\[Audio\]/gi, "")
        .replace(/\(Lyrics\)/gi, "")
        .replace(/\[Lyrics\]/gi, "")
        .replace(/\(Lyric Video\)/gi, "")
        .trim();

      let artist = video.author?.name || "YouTube Creator";

      if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        if (parts.length >= 2) {
          artist = parts[0].trim();
          cleanTitle = parts.slice(1).join(" - ").trim();
        }
      }

      const thumbnail =
        video.thumbnail ||
        video.image ||
        `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

      const duration = video.seconds || 210;

      return {
        id: video.videoId,
        title: cleanTitle || video.title,
        artist,
        album: video.author?.name ? `${video.author.name} (YouTube)` : "YouTube Master",
        duration,
        thumbnailUrl: thumbnail,
        coverUrl: thumbnail,
        youtubeId: video.videoId,
        genre: "YouTube Stream",
        bpm: 110,
        peakTimestamp: Math.floor(duration * 0.35),
      };
    });

    return NextResponse.json({ results: tracks });
  } catch (err) {
    console.error("YouTube search error:", err);
    return NextResponse.json(
      { error: "Failed to search YouTube", results: [] },
      { status: 500 }
    );
  }
}
