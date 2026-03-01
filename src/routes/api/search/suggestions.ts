import { createFileRoute } from '@tanstack/react-router'
import type { SongSuggestionResponse } from '../../../lib/types/api'
import { getYouTubeInnertube } from '../../../server/services/youtubei'

interface SearchSongItem {
  id: string
  title: string
  artists?: Array<{ name: string }>
  author?: { name: string }
  album?: { name: string }
  duration?: { seconds: number }
  thumbnails?: Array<{ url: string; width?: number | string; height?: number | string }>
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pickBestThumbnail(
  thumbnails: Array<{ url: string; width?: number | string; height?: number | string }> = [],
) {
  if (thumbnails.length === 0) return ''
  return [...thumbnails].sort(
    (a, b) =>
      Number(b.width ?? 0) * Number(b.height ?? 0) - Number(a.width ?? 0) * Number(a.height ?? 0),
  )[0]?.url || ''
}

function isSearchSongItem(value: unknown): value is SearchSongItem {
  if (!value || typeof value !== 'object') return false

  const candidate = value as { id?: unknown; title?: unknown }
  return typeof candidate.id === 'string' && typeof candidate.title === 'string'
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

        const youtube = await getYouTubeInnertube()
        const results = await youtube.music.search(query, { type: 'song' })
        const items = ((results.contents?.[0]?.contents || []).filter(
          isSearchSongItem,
        ) as unknown as SearchSongItem[])

        return Response.json({
          query,
          limit,
          items: items.slice(0, limit).map((song) => ({
            videoId: song.id!,
            title: song.title!,
            artist: song.artists?.[0]?.name || song.author?.name || 'Unknown artist',
            album: song.album?.name || null,
            durationSec: song.duration?.seconds || 0,
            thumbnailUrl: pickBestThumbnail(song.thumbnails),
          })),
        } as SongSuggestionResponse)
      },
    },
  },
})
