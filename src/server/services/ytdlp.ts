import { existsSync } from 'node:fs'
import { YtDlp, helpers } from 'ytdlp-nodejs'
import { getServerEnv } from '../env'

let ytDlpClient: YtDlp | null = null
const DEFAULT_YTDLP_BINARY_PATH = '/app/bin/yt-dlp-custom'

async function ensureBinaryPath(customPath?: string) {
  if (customPath) return customPath
  if (existsSync(DEFAULT_YTDLP_BINARY_PATH)) return DEFAULT_YTDLP_BINARY_PATH

  const detected = helpers.findYtdlpBinary()
  if (detected) return detected

  try {
    return await helpers.downloadYtDlp()
  } catch (error) {
    throw new Error(
      `Unable to resolve yt-dlp binary automatically: ${String(error)}`,
    )
  }
}

export async function getYtDlp() {
  if (ytDlpClient) return ytDlpClient

  const env = getServerEnv()
  const binaryPath = await ensureBinaryPath(env.YTDLP_BINARY_PATH)

  ytDlpClient = new YtDlp({
    binaryPath,
    ffmpegPath: env.FFMPEG_PATH,
  })

  return ytDlpClient
}
