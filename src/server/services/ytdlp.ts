import { YtDlp, helpers } from 'ytdlp-nodejs'
import { getServerEnv } from '../env'

let ytDlpClient: YtDlp | null = null

async function ensureBinaryPath(customPath?: string) {
  if (customPath) return customPath

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
