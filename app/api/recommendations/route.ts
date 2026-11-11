import { NextRequest, NextResponse } from "next/server";
import ytSearch from "yt-search";
import { Track } from "@/types/music";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get("artist") || "";
    const title = searchParams.get("title") || "";
    const genre = searchParams.get("genre") || "";
    const excludeId = searchParams.get("excludeId") || "";

    const searchQuery = [artist, genre, "music audio"].filter(Boolean).join(" ") || "chill atmospheric music";

    const searchResults = await ytSearch({
      query: searchQuery,
      pageStart: 1,
      pageEnd: 1,
    });

    const videos = searchResults.videos || [];

    const mappedTracks: Track[] = videos
      .filter((video) => video.videoId !== excludeId && video.seconds > 60 && video.seconds < 1800)
      .slice(0, 8)
      .map((video) => {
        const durationSecs = video.seconds || 240;
        return {
          id: video.videoId,
          title: video.title.replace(/\[.*?\]|\(.*?\)/g, "").trim() || video.title,
          artist: video.author?.name || artist || "YouTube Artist",
          album: "YouTube Music",
          duration: durationSecs,
          coverUrl: video.thumbnail,
          thumbnailUrl: video.thumbnail,
          youtubeId: video.videoId,
          genre: genre || "Electronic / Atmospheric",
          bpm: 110,
          peakTimestamp: Math.floor(durationSecs * 0.35),
        };
      });

    return NextResponse.json({
      recommendations: mappedTracks,
      query: searchQuery,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Recommendation lookup failed";
    return NextResponse.json({ error: message, recommendations: [] }, { status: 500 });
  }
}
