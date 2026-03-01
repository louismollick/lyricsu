export interface SongSearchItem {
  videoId: string
  title: string
  artist: string
  album?: string | null
  durationSec?: number | null
  thumbnailUrl: string
}

export interface SongSuggestionResponse {
  query: string
  limit: number
  items: SongSearchItem[]
}

export interface SpotifyMatchCandidate {
  trackId: string
  name: string
  artists: string[]
  durationMs: number
  album: string
  imageUrl: string
  score: number
}

export interface SpotifyMatchResponse {
  video: SongSearchItem
  selectedTrackId: string | null
  selectedScore: number
  candidates: SpotifyMatchCandidate[]
}

export interface LyricsLine {
  startTimeMs: number
  endTimeMs?: number
  words: string
}

export interface LyricsResponse {
  syncType: string
  lines: LyricsLine[]
}
