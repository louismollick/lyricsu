import type { SongSearchItem } from '../../lib/types/api'
import { getYtMusic } from './ytmusic'
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
const directMediaUrlCache = new Map<string, { url: string; expiresAtMs: number }>()

function pickBestThumbnail(
  thumbnails: Array<{ url: string; width: number; height: number }> = [],
) {
  if (thumbnails.length === 0) return ''

  const sorted = [...thumbnails].sort((a, b) => b.width * b.height - a.width * a.height)
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

export async function getVideoMetadata(videoId: string): Promise<SongSearchItem> {
  const ytmusic = await getYtMusic()
  const song = await ytmusic.getSong(videoId)

  return {
    videoId: song.videoId,
    title: song.name,
    artist: song.artist.name,
    album: null,
    durationSec: song.duration,
    thumbnailUrl: pickBestThumbnail(song.thumbnails),
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
  const watchUrl = `https://music.youtube.com/watch?v=${videoId}`

  const directUrls = await ytdlp.getDirectUrlsAsync(watchUrl, {
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
