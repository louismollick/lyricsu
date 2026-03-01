import { createFileRoute } from '@tanstack/react-router'
import { getDirectMediaUrl } from '../../../../server/services/video'

function copyHeader(
  source: Headers,
  target: Headers,
  sourceName: string,
  targetName = sourceName,
) {
  const value = source.get(sourceName)
  if (value) {
    target.set(targetName, value)
  }
}

export const Route = createFileRoute('/api/media/stream/$videoId')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const forwardHeaders = new Headers()
        const range = request.headers.get('range')
        if (range) {
          forwardHeaders.set('range', range)
        }

        let directUrl = await getDirectMediaUrl(params.videoId)
        let upstream = await fetch(directUrl, {
          headers: forwardHeaders,
        })

        if (upstream.status === 401 || upstream.status === 403) {
          directUrl = await getDirectMediaUrl(params.videoId, { forceRefresh: true })
          upstream = await fetch(directUrl, {
            headers: forwardHeaders,
          })
        }

        if (!upstream.ok && upstream.status !== 206) {
          return Response.json(
            { error: true, message: 'Upstream media request failed' },
            { status: upstream.status },
          )
        }

        const headers = new Headers()
        copyHeader(upstream.headers, headers, 'content-type')
        copyHeader(upstream.headers, headers, 'content-length')
        copyHeader(upstream.headers, headers, 'content-range')
        copyHeader(upstream.headers, headers, 'accept-ranges')
        headers.set('cache-control', 'no-store')

        return new Response(upstream.body, {
          status: upstream.status,
          headers,
        })
      },
    },
  },
})
