import { existsSync } from 'node:fs'
import type { SongSearchItem } from '../../lib/types/api'
import { getServerEnv } from '../env'
import { getYouTubeInnertube } from './youtubei'
import { getYtDlp } from './ytdlp'

const IMAGE_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
])
const DIRECT_URL_REFRESH_BUFFER_MS = 30_000
const DIRECT_URL_FALLBACK_TTL_MS = 5 * 60 * 1000
const DEFAULT_YTDLP_COOKIES_PATH = '/app/secrets/youtube-cookies.txt'
const directMediaUrlCache = new Map<string, { url: string; expiresAtMs: number }>()

function pickBestThumbnail(
  thumbnails: Array<{ url: string; width?: number | string; height?: number | string }> = [],
) {
  if (thumbnails.length === 0) return ''

  const sorted = [...thumbnails].sort(
    (a, b) =>
      Number(b.width ?? 0) * Number(b.height ?? 0) - Number(a.width ?? 0) * Number(a.height ?? 0),
  )
  return sorted[0]?.url || ''
}

function getFileExtension(pathname: string) {
  const lastDotIndex = pathname.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return pathname.slice(lastDotIndex + 1).toLowerCase()
}

function extractExpiryMs(urlText: string) {
  try {
    const url = new URL(urlText)
    const expireRaw = Number(url.searchParams.get('expire'))
    if (!Number.isFinite(expireRaw) || expireRaw <= 0) {
      return null
    }
    return expireRaw * 1000
  } catch {
    return null
  }
}

export function selectPlayableMediaUrl(candidates: string[]) {
  const parsed = candidates
    .map((candidate) => {
      try {
        const url = new URL(candidate)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return null
        }
        return { candidate, url }
      } catch {
        return null
      }
    })
    .filter((entry): entry is { candidate: string; url: URL } => entry !== null)

  const playableByMime = parsed.find(({ url }) => {
    const mime = url.searchParams.get('mime')?.toLowerCase() || ''
    return mime.startsWith('audio/') || mime.startsWith('video/')
  })

  if (playableByMime) {
    return playableByMime.candidate
  }

  const nonImageByExtension = parsed.find(({ url }) => {
    const mime = url.searchParams.get('mime')?.toLowerCase() || ''
    if (mime.startsWith('image/')) {
      return false
    }

    const extension = getFileExtension(url.pathname)
    return extension ? !IMAGE_EXTENSIONS.has(extension) : true
  })

  return nonImageByExtension?.candidate
}

function getYtDlpRequestOptions() {
  const env = getServerEnv()
  const cookiesPath = env.YTDLP_COOKIES_PATH || (
    existsSync(DEFAULT_YTDLP_COOKIES_PATH) ? DEFAULT_YTDLP_COOKIES_PATH : undefined
  )

  return {
    cookies: cookiesPath,
    ignoreNoFormatsError: true,
    jsRuntime: 'node' as const,
  }
}

export async function getVideoMetadata(videoId: string): Promise<SongSearchItem> {
  const youtube = await getYouTubeInnertube()
  const track = await youtube.music.getInfo(videoId)

  if (track.playability_status?.status && track.playability_status.status !== 'OK') {
    const reason = track.playability_status.reason?.trim()
    throw new Error(reason || `YouTube music track is not playable (${track.playability_status.status})`)
  }

  if (!track.basic_info.id || !track.basic_info.title) {
    throw new Error('Failed to resolve YouTube Music track metadata')
  }

  return {
    videoId: track.basic_info.id,
    title: track.basic_info.title,
    artist: track.basic_info.author || track.basic_info.channel?.name || 'Unknown artist',
    album: null,
    durationSec: track.basic_info.duration ?? 0,
    thumbnailUrl: pickBestThumbnail(track.basic_info.thumbnail),
  }
}

interface GetDirectMediaUrlOptions {
  forceRefresh?: boolean
}

export async function getDirectMediaUrl(videoId: string, options: GetDirectMediaUrlOptions = {}) {
  const cached = directMediaUrlCache.get(videoId)
  if (
    cached &&
    !options.forceRefresh &&
    cached.expiresAtMs > Date.now() + DIRECT_URL_REFRESH_BUFFER_MS
  ) {
    return cached.url
  }

  const ytdlp = await getYtDlp()
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  const directUrls = await ytdlp.getDirectUrlsAsync(watchUrl, {
    ...getYtDlpRequestOptions(),
    format: 'bestaudio/best',
  })
  const chosen = selectPlayableMediaUrl(directUrls)

  if (!chosen) {
    throw new Error('No direct media URL available for this track')
  }

  directMediaUrlCache.set(videoId, {
    url: chosen,
    expiresAtMs: extractExpiryMs(chosen) ?? Date.now() + DIRECT_URL_FALLBACK_TTL_MS,
  })

  return chosen
}
