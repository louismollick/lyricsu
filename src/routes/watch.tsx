import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, RefreshCcw } from 'lucide-react'
import { BottomPlayerBar } from '../components/player/BottomPlayerBar'
import { LyricsTimeline } from '../components/lyrics/LyricsTimeline'
import { YomitanPopup } from '../components/yomitan/YomitanPopup'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import type { LyricsResponse, SongSearchItem, SpotifyMatchCandidate, SpotifyMatchResponse } from '../lib/types/api'
import {
  buildEnabledDictionaryMap,
  getInstalledDictionaries,
  lookupTerm,
  renderTermEntriesHtml,
  tokenizeText,
} from '../lib/yomitan/core'
import type { YomitanToken } from '../lib/yomitan/core'
import {
  loadDictionaryPreferences,
  normalizeDictionaryPreferences,
  saveDictionaryPreferences,
} from '../lib/yomitan/preferences'
import {
  cacheLyrics,
  getCachedLyrics,
  getOfflineTrack,
  isTrackOffline,
  saveOfflineTrack,
} from '../lib/db/app-db'

export const Route = createFileRoute('/watch')({
  validateSearch: (search: Record<string, unknown>) => ({
    v: typeof search.v === 'string' ? search.v : '',
  }),
  component: WatchPage,
})

function findActiveLineIndex(lines: LyricsResponse['lines'], currentTimeSec: number) {
  const nowMs = currentTimeSec * 1000

  for (let index = 0; index < lines.length; index += 1) {
    const start = lines[index]?.startTimeMs ?? 0
    const nextStart = lines[index + 1]?.startTimeMs ?? Number.POSITIVE_INFINITY

    if (nowMs >= start && nowMs < nextStart) {
      return index
    }
  }

  return 0
}

async function downloadTrackBlob(videoId: string) {
  const response = await fetch(`/api/media/download/${encodeURIComponent(videoId)}`)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  return response.blob()
}

function WatchPage() {
  const { v: videoId } = Route.useSearch()
  const [video, setVideo] = useState<SongSearchItem | null>(null)
  const [candidates, setCandidates] = useState<SpotifyMatchCandidate[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null)
  const [lyricsRefreshNonce, setLyricsRefreshNonce] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLineIndex, setActiveLineIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [offlineReady, setOfflineReady] = useState(false)
  const [playbackReady, setPlaybackReady] = useState(false)
  const [preparingPlayback, setPreparingPlayback] = useState(false)
  const [downloadingOffline, setDownloadingOffline] = useState(false)
  const [tokenizedLines, setTokenizedLines] = useState<Partial<Record<number, YomitanToken[]>>>({})
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupTermText, setLookupTermText] = useState('')
  const [lookupHtml, setLookupHtml] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null)
  const lineNodeMapRef = useRef<Map<number, HTMLButtonElement>>(new Map())
  const scrollSeekDebounceRef = useRef<number | null>(null)
  const autoScrollBlockedRef = useRef(false)
  const scrollSeekIntentRef = useRef(false)
  const objectUrlRef = useRef<string | null>(null)

  const hasVideoId = Boolean(videoId)

  useEffect(() => {
    if (!hasVideoId) {
      setError('Missing video ID in URL. Open a song from the home page.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      setError(null)

      try {
        const matchResponse = await fetch(`/api/lyrics/match/${encodeURIComponent(videoId)}`)
        if (!matchResponse.ok) {
          throw new Error(`Failed to resolve song data (${matchResponse.status})`)
        }

        const matchPayload = (await matchResponse.json()) as SpotifyMatchResponse
        if (cancelled) return

        setVideo(matchPayload.video)
        setCandidates(matchPayload.candidates)
        setSelectedTrackId(matchPayload.selectedTrackId)
        setOfflineReady(await isTrackOffline(matchPayload.video.videoId))
      } catch (bootstrapError) {
        if (cancelled) return
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : 'Failed to initialize watch page',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [hasVideoId, videoId])

  useEffect(() => {
    if (!video) return

    const currentVideo = video
    let cancelled = false

    async function resolveAudioSource() {
      const audio = audioRef.current
      if (!audio) return

      setPreparingPlayback(true)
      setPlaybackReady(false)

      audio.pause()
      setPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      audio.removeAttribute('src')
      audio.load()

      const offlineTrack = await getOfflineTrack(currentVideo.videoId)
      if (cancelled) return

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      if (offlineTrack) {
        const url = URL.createObjectURL(offlineTrack.blob)
        objectUrlRef.current = url
        audio.src = url
        audio.load()
        setOfflineReady(true)
        setPlaybackReady(true)
        setPreparingPlayback(false)
        return
      }

      audio.src = `/api/media/stream/${encodeURIComponent(currentVideo.videoId)}`
      audio.load()
      setOfflineReady(false)
      setPlaybackReady(true)
      setPreparingPlayback(false)
    }

    void resolveAudioSource()

    return () => {
      cancelled = true
    }
  }, [video])

  useEffect(() => {
    return () => {
      if (scrollSeekDebounceRef.current) {
        window.clearTimeout(scrollSeekDebounceRef.current)
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedTrackId) {
      setLyrics(null)
      return
    }

    const trackId = selectedTrackId
    let cancelled = false

    async function fetchLyrics() {
      setLoadingLyrics(true)
      setError(null)

      try {
        const cached = await getCachedLyrics(trackId)
        if (cached && !cancelled) {
          setLyrics(cached.payload)
        }

        const response = await fetch(`/api/lyrics/track/${encodeURIComponent(trackId)}`)
        if (!response.ok) {
          throw new Error('Lyrics are unavailable for this song.')
        }

        const payload = (await response.json()) as LyricsResponse
        if (cancelled) return

        setLyrics(payload)
        await cacheLyrics(trackId, payload)
      } catch (lyricsError) {
        if (!cancelled) {
          setLyrics(null)
          setError(lyricsError instanceof Error ? lyricsError.message : String(lyricsError))
        }
      } finally {
        if (!cancelled) {
          setLoadingLyrics(false)
        }
      }
    }

    void fetchLyrics()

    return () => {
      cancelled = true
    }
  }, [selectedTrackId, lyricsRefreshNonce])

  useEffect(() => {
    if (!lyrics?.lines.length) {
      setTokenizedLines({})
      return
    }

    const currentLyrics = lyrics
    let cancelled = false

    async function tokenizeLines() {
      try {
        const dictionaries = await getInstalledDictionaries()
        const normalized = normalizeDictionaryPreferences(
          dictionaries.map((item) => item.title),
          loadDictionaryPreferences(),
        )
        saveDictionaryPreferences(normalized)

        const enabledMap = buildEnabledDictionaryMap(normalized)
        if (!enabledMap.size) {
          setTokenizedLines({})
          return
        }

        const mapping: Partial<Record<number, YomitanToken[]>> = {}
        for (const [index, line] of currentLyrics.lines.entries()) {
          const text = line.words.trim()
          if (!text) continue
          mapping[index] = await tokenizeText(text, enabledMap)
        }

        if (!cancelled) {
          setTokenizedLines(mapping)
        }
      } catch {
        if (!cancelled) {
          setTokenizedLines({})
        }
      }
    }

    void tokenizeLines()

    return () => {
      cancelled = true
    }
  }, [lyrics])

  useEffect(() => {
    if (!lyrics?.lines.length) return

    if (autoScrollBlockedRef.current) return
    const target = lineNodeMapRef.current.get(activeLineIndex)
    if (!target) return

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [activeLineIndex, lyrics])

  async function handleWordTap(token: YomitanToken) {
    try {
      setLookupOpen(true)
      setLookupTermText(token.text)
      setLookupLoading(true)

      const dictionaries = await getInstalledDictionaries()
      const normalized = normalizeDictionaryPreferences(
        dictionaries.map((item) => item.title),
        loadDictionaryPreferences(),
      )
      const enabledMap = buildEnabledDictionaryMap(normalized)

      if (!enabledMap.size) {
        setLookupHtml('<p style="color:#fff">Enable at least one dictionary in Settings.</p>')
        return
      }

      const result = await lookupTerm(token.text, enabledMap)
      const html = await renderTermEntriesHtml(result.entries)
      setLookupHtml(html)
    } catch (lookupError) {
      setLookupHtml(
        `<p style="color:#fff">Lookup failed: ${
          lookupError instanceof Error ? lookupError.message : String(lookupError)
        }</p>`,
      )
    } finally {
      setLookupLoading(false)
    }
  }

  function handleLineSeek(startTimeMs: number) {
    if (!audioRef.current || !playbackReady) return
    audioRef.current.currentTime = startTimeMs / 1000
  }

  function markScrollSeekIntent() {
    scrollSeekIntentRef.current = true
  }

  function handleTimelineScroll() {
    if (!scrollSeekIntentRef.current) return

    autoScrollBlockedRef.current = true

    if (scrollSeekDebounceRef.current) {
      window.clearTimeout(scrollSeekDebounceRef.current)
    }

    scrollSeekDebounceRef.current = window.setTimeout(() => {
      if (!lyricsScrollRef.current || !lyrics?.lines.length || !audioRef.current) {
        autoScrollBlockedRef.current = false
        scrollSeekIntentRef.current = false
        return
      }

      const viewport = lyricsScrollRef.current.getBoundingClientRect()
      const center = viewport.top + viewport.height / 2

      let chosen: { index: number; distance: number } | null = null
      for (const [index, node] of lineNodeMapRef.current.entries()) {
        const rect = node.getBoundingClientRect()
        const nodeCenter = rect.top + rect.height / 2
        const distance = Math.abs(center - nodeCenter)

        if (!chosen || distance < chosen.distance) {
          chosen = { index, distance }
        }
      }

      if (chosen) {
        const line = lyrics.lines[chosen.index]
        audioRef.current.currentTime = line.startTimeMs / 1000
        setActiveLineIndex(chosen.index)
      }

      autoScrollBlockedRef.current = false
      scrollSeekIntentRef.current = false
    }, 120)
  }

  async function handleSaveOffline() {
    if (!video || downloadingOffline) return

    setDownloadingOffline(true)
    try {
      const blob = await downloadTrackBlob(video.videoId)
      await saveOfflineTrack(video, blob)
      setOfflineReady(true)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : String(downloadError))
    } finally {
      setDownloadingOffline(false)
    }
  }

  const lines = lyrics?.lines || []

  const title = useMemo(() => {
    if (!video) return 'Loading...'
    return `${video.title} — ${video.artist}`
  }, [video])

  if (!hasVideoId) {
    return (
      <main className="mx-auto max-w-3xl px-3 py-6 text-slate-100">
        <Card>
          <CardHeader>
            <CardTitle>Missing song id</CardTitle>
            <CardDescription>
              Open a song from the home page so the URL includes
              <code className="mx-1 rounded bg-slate-800 px-1 py-0.5">/watch?v=VIDEO_ID</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/" className="text-cyan-400 hover:text-cyan-300">
              Back to search
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_65%)] px-3 pb-8 pt-4 text-slate-100">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => {
          const current = event.currentTarget.currentTime
          setCurrentTime(current)

          if (lyrics?.lines.length) {
            const nextIndex = findActiveLineIndex(lyrics.lines, current)
            setActiveLineIndex(nextIndex)
          }
        }}
        onDurationChange={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="truncate">{title}</CardTitle>
            <CardDescription className="break-all text-xs text-slate-500">
              URL source of truth: /watch?v={videoId}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (!audioRef.current || !playbackReady) return
                  if (audioRef.current.paused) {
                    void audioRef.current.play()
                  } else {
                    audioRef.current.pause()
                  }
                }}
                disabled={!video || loading || preparingPlayback || !playbackReady}
              >
                {preparingPlayback ? 'Preparing audio...' : playing ? 'Pause' : 'Play'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setLyricsRefreshNonce((prev) => prev + 1)
                }}
                disabled={!selectedTrackId || loadingLyrics}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh lyrics
              </Button>
              <Link to="/settings" className="text-sm text-cyan-400 hover:text-cyan-300">
                Dictionary settings
              </Link>
            </div>

            {candidates.length ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Change lyrics track
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {candidates.slice(0, 6).map((candidate) => (
                    <button
                      type="button"
                      key={candidate.trackId}
                      onClick={() => setSelectedTrackId(candidate.trackId)}
                      className={`rounded-md border px-2 py-2 text-left text-xs transition ${
                        selectedTrackId === candidate.trackId
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <p className="truncate font-semibold">{candidate.name}</p>
                      <p className="truncate text-slate-400">{candidate.artists.join(', ')}</p>
                      <p className="text-slate-500">score {candidate.score.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synced lyrics</CardTitle>
            <CardDescription>
              Tap a line to seek. Scroll the lyric list to scrub. Tap Japanese words for Yomitan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || loadingLyrics ? (
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading song and lyrics...
              </div>
            ) : lines.length === 0 ? (
              <p className="text-sm text-slate-400">No lyrics available for this selection.</p>
            ) : (
              <div
                ref={lyricsScrollRef}
                className="max-h-[64vh] overflow-y-auto pr-1"
                onScroll={handleTimelineScroll}
                onWheel={markScrollSeekIntent}
                onTouchMove={markScrollSeekIntent}
              >
                <LyricsTimeline
                  lines={lines}
                  activeIndex={activeLineIndex}
                  tokenizedLines={tokenizedLines}
                  onWordTap={handleWordTap}
                  onLineSeek={(line, index) => {
                    handleLineSeek(line.startTimeMs)
                    setActiveLineIndex(index)
                  }}
                  registerLineRef={(index, node) => {
                    if (node) {
                      lineNodeMapRef.current.set(index, node)
                    } else {
                      lineNodeMapRef.current.delete(index)
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomPlayerBar
        track={video}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        offlineReady={offlineReady}
        downloading={downloadingOffline}
        playDisabled={!playbackReady || preparingPlayback}
        onTogglePlay={() => {
          if (!audioRef.current || !playbackReady) return
          if (audioRef.current.paused) {
            void audioRef.current.play()
          } else {
            audioRef.current.pause()
          }
        }}
        onSeek={(seconds) => {
          if (!audioRef.current || !playbackReady) return
          audioRef.current.currentTime = seconds
        }}
        onDownload={handleSaveOffline}
      />

      <YomitanPopup
        open={lookupOpen}
        term={lookupTermText}
        html={lookupHtml}
        loading={lookupLoading}
        onClose={() => setLookupOpen(false)}
      />
    </main>
  )
}
