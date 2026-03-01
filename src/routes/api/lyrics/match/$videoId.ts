import { createFileRoute } from '@tanstack/react-router'
import type { SpotifyMatchCandidate, SpotifyMatchResponse } from '../../../../lib/types/api'
import { getVideoMetadata } from '../../../../server/services/video'
import { getSpotifyApi } from '../../../../server/services/spotify'
import { calculateCandidateScore } from '../../../../server/utils/spotify-match'

export const Route = createFileRoute('/api/lyrics/match/$videoId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const video = await getVideoMetadata(params.videoId)
        const spotify = getSpotifyApi()
        const searchResult = await spotify.search(
          `${video.title} ${video.artist}`,
          ['track'],
          undefined,
          10,
        )

        const candidates: SpotifyMatchCandidate[] = searchResult.tracks.items
          .map((track) => {
            const raw = {
              trackId: track.id,
              name: track.name,
              artists: track.artists.map((artist) => artist.name),
              durationMs: track.duration_ms,
              album: track.album.name,
              imageUrl: track.album.images[0]?.url || '',
            }

            return {
              ...raw,
              score: calculateCandidateScore(video, raw),
            }
          })
          .sort((a, b) => b.score - a.score)

        const response: SpotifyMatchResponse = {
          video,
          selectedTrackId: candidates[0]?.trackId ?? null,
          selectedScore: candidates[0]?.score ?? 0,
          candidates,
        }

        return Response.json(response)
      },
    },
  },
})
