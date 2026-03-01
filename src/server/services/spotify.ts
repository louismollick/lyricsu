import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { getServerEnv } from '../env'

let spotifyClient: SpotifyApi | null = null

export function getSpotifyApi() {
  if (spotifyClient) return spotifyClient

  const env = getServerEnv()
  spotifyClient = SpotifyApi.withClientCredentials(
    env.SPOTIFY_CLIENT_ID,
    env.SPOTIFY_CLIENT_SECRET,
  )

  return spotifyClient
}
