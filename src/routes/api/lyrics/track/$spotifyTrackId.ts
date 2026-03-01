import { createFileRoute } from '@tanstack/react-router'
import type { LyricsResponse } from '../../../../lib/types/api'
import { getLyricsBySpotifyTrackId } from '../../../../server/services/lyrics-api'

const lyricCache = new Map<string, { expiresAt: number; payload: LyricsResponse }>()
const TTL_MS = 24 * 60 * 60 * 1000

export const Route = createFileRoute('/api/lyrics/track/$spotifyTrackId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const now = Date.now()
        const cached = lyricCache.get(params.spotifyTrackId)
        if (cached && cached.expiresAt > now) {
          return Response.json(cached.payload)
        }

        try {
          const payload = await getLyricsBySpotifyTrackId(params.spotifyTrackId)
          lyricCache.set(params.spotifyTrackId, {
            expiresAt: now + TTL_MS,
            payload,
          })

          return Response.json(payload)
        } catch (error) {
          return Response.json(
            {
              error: true,
              message: error instanceof Error ? error.message : String(error),
            },
            { status: 404 },
          )
        }
      },
    },
  },
})
