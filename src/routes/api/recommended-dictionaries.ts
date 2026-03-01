import { createFileRoute } from '@tanstack/react-router'
import { ALLOWED_RECOMMENDED_DICTIONARY_URLS } from '../../lib/yomitan/recommended-dictionaries'

const FORWARDED_HEADERS = ['content-type', 'content-length', 'content-disposition', 'etag']

export const Route = createFileRoute('/api/recommended-dictionaries')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url)
        const targetUrl = requestUrl.searchParams.get('url')

        if (!targetUrl) {
          return new Response('Missing url query parameter', { status: 400 })
        }

        if (!ALLOWED_RECOMMENDED_DICTIONARY_URLS.has(targetUrl)) {
          return new Response('Dictionary URL is not in the approved allowlist', { status: 403 })
        }

        try {
          const upstream = await fetch(targetUrl, {
            redirect: 'follow',
            cache: 'no-store',
          })

          if (!upstream.ok || !upstream.body) {
            return new Response(`Failed to download dictionary (HTTP ${upstream.status})`, {
              status: upstream.status || 502,
            })
          }

          const headers = new Headers()
          for (const header of FORWARDED_HEADERS) {
            const value = upstream.headers.get(header)
            if (value) headers.set(header, value)
          }

          return new Response(upstream.body, {
            status: 200,
            headers,
          })
        } catch {
          return new Response('Failed to download dictionary from upstream source', {
            status: 502,
          })
        }
      },
    },
  },
})
