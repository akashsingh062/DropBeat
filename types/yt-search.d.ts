declare module "yt-search" {
  export interface VideoSearchResult {
    type: "video";
    videoId: string;
    url: string;
    title: string;
    description: string;
    image: string;
    thumbnail: string;
    seconds: number;
    timestamp: string;
    duration: {
      toString: () => string;
      seconds: number;
      timestamp: string;
    };
    views: number;
    genre?: string;
    author: {
      name: string;
      url: string;
    };
  }

  export interface SearchResult {
    all: any[];
    videos: VideoSearchResult[];
    live: any[];
    playlists: any[];
    channels: any[];
    accounts: any[];
  }

  export interface SearchOptions {
    query?: string;
    search?: string;
    pageStart?: number;
    pageEnd?: number;
    category?: string;
    sp?: string;
  }

  export default function search(
    query: string | SearchOptions,
    callback?: (err: Error | null, r: SearchResult) => void
  ): Promise<SearchResult>;
}

