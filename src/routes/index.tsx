import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Search, Music2, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SongSearchItem, SongSuggestionResponse } from '../lib/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const navigate = useNavigate({ from: '/' })
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SongSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const debounceRef = useRef<number | null>(null)

  const limit = expanded ? 25 : 8
  const trimmedQuery = query.trim()

  async function searchSongs(nextQuery: string, nextLimit: number) {
    if (!nextQuery.trim()) {
      setItems([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(nextQuery)}&limit=${nextLimit}`,
      )
      if (!response.ok) {
        throw new Error(`Search request failed (${response.status})`)
      }

      const payload = (await response.json()) as SongSuggestionResponse
      setItems(payload.items)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!trimmedQuery) {
      setItems([])
      return
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }

    debounceRef.current = window.setTimeout(() => {
      void searchSongs(trimmedQuery, limit)
    }, 260)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [trimmedQuery, limit])

  const helperText = useMemo(() => {
    if (!trimmedQuery) return 'Search by song name, artist, or both.'
    if (loading) return 'Searching YouTube Music...'
    if (items.length === 0) return 'No songs found yet.'
    return `${items.length} result${items.length > 1 ? 's' : ''} ready`
  }, [items.length, loading, trimmedQuery])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_65%)] px-3 pb-8 pt-4 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Music2 className="h-5 w-5 text-cyan-400" />
              Find a Song
            </CardTitle>
            <CardDescription>
              Search and open a watch page using a YouTube-style URL (`/watch?v=...`).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => {
                  setExpanded(false)
                  setQuery(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setExpanded(true)
                    void searchSongs(query, 25)
                  }
                }}
                placeholder="e.g. YOASOBI アイドル"
                className="pl-10"
              />
            </div>

            <p className="text-xs text-slate-400">{error || helperText}</p>

            {trimmedQuery ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    setExpanded((prev) => !prev)
                  }}
                >
                  {expanded ? 'Show fewer' : 'Show more'}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.videoId}
                to="/watch"
                search={{ v: item.videoId }}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-2 transition hover:border-cyan-500/50"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="h-14 w-14 rounded-md border border-slate-800 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="truncate text-xs text-slate-400">{item.artist}</p>
                  <p className="truncate text-[11px] text-slate-500">id: {item.videoId}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:text-cyan-300" />
              </Link>
            ))}
          </div>
        ) : null}

        {!trimmedQuery ? (
          <Card>
            <CardContent className="pt-4 text-sm text-slate-300">
              <p>
                Flow: search song on this page {'->'} tap result {'->'} open
                <code className="mx-1 rounded bg-slate-800 px-1 py-0.5">/watch?v=VIDEO_ID</code>
                {'->'} read synced lyrics and tap words for Yomitan definitions.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => void navigate({ to: '/settings' })}
              >
                Open Dictionary Settings
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}
