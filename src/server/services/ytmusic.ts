import YTMusic from 'ytmusic-api'
import { getServerEnv } from '../env'

let ytmusicPromise: Promise<YTMusic> | null = null

export function getYtMusic() {
  if (ytmusicPromise) return ytmusicPromise

  ytmusicPromise = (async () => {
    const env = getServerEnv()
    const client = new YTMusic()

    await client.initialize(
      env.YTMUSIC_COOKIES ? { cookies: env.YTMUSIC_COOKIES } : undefined,
    )

    return client
  })()

  return ytmusicPromise
}
