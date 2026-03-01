import { createFileRoute } from '@tanstack/react-router'
import type { SongSuggestionResponse } from '../../../lib/types/api'
import { getYtMusic } from '../../../server/services/ytmusic'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pickBestThumbnail(
  thumbnails: Array<{ url: string; width: number; height: number }> = [],
) {
  if (thumbnails.length === 0) return ''
  return [...thumbnails].sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url || ''
}

export const Route = createFileRoute('/api/search/suggestions')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const query = (url.searchParams.get('q') || '').trim()
        const limit = clamp(Number(url.searchParams.get('limit') || 8) || 8, 1, 50)

        if (!query) {
          return Response.json({
            query,
            limit,
            items: [],
          } as SongSuggestionResponse)
        }

        const ytmusic = await getYtMusic()
        const results = await ytmusic.searchSongs(query)

        return Response.json({
          query,
          limit,
          items: results.slice(0, limit).map((song) => ({
            videoId: song.videoId,
            title: song.name,
            artist: song.artist.name,
            album: song.album?.name || null,
            durationSec: song.duration,
            thumbnailUrl: pickBestThumbnail(song.thumbnails),
          })),
        } as SongSuggestionResponse)
      },
    },
  },
})
