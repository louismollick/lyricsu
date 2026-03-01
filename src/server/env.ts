import { z } from 'zod'

const serverEnvSchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_LYRICS_API_URL: z.string().url().default('http://spotify-lyrics-api:8080'),
  YTMUSIC_COOKIES: z.string().optional(),
  YTDLP_BINARY_PATH: z.string().optional(),
  FFMPEG_PATH: z.string().optional(),
})

let parsedEnv: z.infer<typeof serverEnvSchema> | null = null

export function getServerEnv() {
  if (parsedEnv) return parsedEnv

  parsedEnv = serverEnvSchema.parse({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_LYRICS_API_URL: process.env.SPOTIFY_LYRICS_API_URL,
    YTMUSIC_COOKIES: process.env.YTMUSIC_COOKIES,
    YTDLP_BINARY_PATH: process.env.YTDLP_BINARY_PATH,
    FFMPEG_PATH: process.env.FFMPEG_PATH,
  })

  return parsedEnv
}
