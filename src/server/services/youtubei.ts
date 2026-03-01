import { existsSync, readFileSync } from 'node:fs'
import { Innertube } from 'youtubei.js'
import { getServerEnv } from '../env'

const COOKIE_NAMES = [
  'LOGIN_INFO',
  '__Secure-1PAPISID',
  '__Secure-1PSID',
  '__Secure-1PSIDCC',
  '__Secure-1PSIDTS',
  '__Secure-3PAPISID',
  '__Secure-3PSID',
  '__Secure-3PSIDCC',
  '__Secure-3PSIDTS',
  '__Secure-ROLLOUT_TOKEN',
  'VISITOR_INFO1_LIVE',
  'VISITOR_PRIVACY_METADATA',
  'YSC',
  'PREF',
  'SAPISID',
]
const DEFAULT_YTDLP_COOKIES_PATH = '/app/secrets/youtube-cookies.txt'

let innertubePromise: Promise<Innertube> | null = null

function finalizeCookieHeader(cookies: Map<string, string>) {
  if (!cookies.has('SAPISID')) {
    const sapisid = cookies.get('__Secure-3PAPISID') || cookies.get('__Secure-1PAPISID')
    if (sapisid) {
      cookies.set('SAPISID', sapisid)
    }
  }

  const slimHeader = COOKIE_NAMES.map((name) => {
    const value = cookies.get(name)
    return value ? `${name}=${value}` : null
  }).filter((cookie): cookie is string => cookie !== null)

  return slimHeader.length > 0 ? slimHeader.join('; ') : undefined
}

export function buildYoutubeCookieHeaderFromNetscapeFile(fileContents?: string) {
  if (!fileContents) return undefined

  const cookies = new Map<string, string>()

  for (const line of fileContents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const parts = line.split('\t')
    if (parts.length < 7) continue

    const [domain, , , , expiresAtRaw, name, ...valueParts] = parts
    if (!domain || !name || !COOKIE_NAMES.includes(name)) continue
    if (!domain.includes('youtube.com')) continue

    const expiresAt = Number(expiresAtRaw)
    if (Number.isFinite(expiresAt) && expiresAt > 0 && expiresAt * 1000 <= Date.now()) {
      continue
    }

    const value = valueParts.join('\t').trim()
    if (!value) continue

    cookies.set(name, value)
  }

  return finalizeCookieHeader(cookies)
}

function resolveCookieFilePath(customPath?: string) {
  if (customPath && existsSync(customPath)) return customPath
  if (existsSync(DEFAULT_YTDLP_COOKIES_PATH)) return DEFAULT_YTDLP_COOKIES_PATH
  return undefined
}

export function getYouTubeInnertube() {
  if (innertubePromise) return innertubePromise

  innertubePromise = (async () => {
    const env = getServerEnv()
    const cookieFilePath = resolveCookieFilePath(env.YTDLP_COOKIES_PATH)
    const cookie = cookieFilePath
      ? buildYoutubeCookieHeaderFromNetscapeFile(readFileSync(cookieFilePath, 'utf8'))
      : undefined

    return Innertube.create(cookie ? { cookie } : undefined)
  })()

  return innertubePromise
}
