import { getServerEnv } from '../env'
import type { LyricsLine, LyricsResponse } from '../../lib/types/api'

interface SpotifyLyricsApiLine {
  startTimeMs?: string
  endTimeMs?: string
  words: string
}

interface SpotifyLyricsApiResponse {
  error: boolean
  message?: string
  syncType?: string
  lines?: SpotifyLyricsApiLine[]
}

function normalizeLine(line: SpotifyLyricsApiLine): LyricsLine {
  return {
    startTimeMs: Number(line.startTimeMs || 0),
    endTimeMs: Number(line.endTimeMs || 0) || undefined,
    words: line.words,
  }
}

export async function getLyricsBySpotifyTrackId(
  spotifyTrackId: string,
): Promise<LyricsResponse> {
  const env = getServerEnv()
  const target = new URL(env.SPOTIFY_LYRICS_API_URL)
  target.searchParams.set('trackid', spotifyTrackId)
  target.searchParams.set('format', 'id3')

  const response = await fetch(target)
  if (!response.ok) {
    throw new Error(`Lyrics API request failed: ${response.status}`)
  }

  const payload = (await response.json()) as SpotifyLyricsApiResponse

  if (payload.error) {
    throw new Error(payload.message || 'Lyrics not available')
  }

  return {
    syncType: payload.syncType || 'UNSYNCED',
    lines: (payload.lines || []).map(normalizeLine),
  }
}
