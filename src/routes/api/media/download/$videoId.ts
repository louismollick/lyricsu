import { createFileRoute } from '@tanstack/react-router'
import { getDirectMediaUrl, getVideoMetadata } from '../../../../server/services/video'

export const Route = createFileRoute('/api/media/download/$videoId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [directUrl, metadata] = await Promise.all([
          getDirectMediaUrl(params.videoId),
          getVideoMetadata(params.videoId),
        ])

        let upstream = await fetch(directUrl)
        if (upstream.status === 401 || upstream.status === 403) {
          const refreshedUrl = await getDirectMediaUrl(params.videoId, { forceRefresh: true })
          upstream = await fetch(refreshedUrl)
        }

        if (!upstream.ok) {
          return Response.json(
            { error: true, message: 'Unable to download track' },
            { status: upstream.status },
          )
        }

        const filename = `${metadata.artist} - ${metadata.title}`
          .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
          .trim()

        const headers = new Headers()
        headers.set('content-type', upstream.headers.get('content-type') || 'audio/mpeg')
        headers.set('cache-control', 'no-store')
        headers.set(
          'content-disposition',
          `attachment; filename="${filename || params.videoId}.audio"`,
        )

        const contentLength = upstream.headers.get('content-length')
        if (contentLength) {
          headers.set('content-length', contentLength)
        }

        return new Response(upstream.body, {
          status: 200,
          headers,
        })
      },
    },
  },
})
