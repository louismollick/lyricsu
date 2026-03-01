import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { LyricsResponse, SongSearchItem } from '../types/api'

export interface OfflineTrack {
  videoId: string
  blob: Blob
  mimeType: string
  title: string
  artist: string
  thumbnailUrl: string
  savedAt: number
}

export interface CachedLyrics {
  spotifyTrackId: string
  payload: LyricsResponse
  savedAt: number
}

export interface StoredSetting {
  key: string
  value: unknown
}

class AppDb extends Dexie {
  offlineTracks!: Table<OfflineTrack, string>
  lyricsCache!: Table<CachedLyrics, string>
  settings!: Table<StoredSetting, string>

  constructor() {
    super('lyricsu-app')

    this.version(1).stores({
      offlineTracks: '&videoId, savedAt',
      lyricsCache: '&spotifyTrackId, savedAt',
      settings: '&key',
    })
  }
}

export const appDb = new AppDb()

export async function saveOfflineTrack(item: SongSearchItem, blob: Blob) {
  await appDb.offlineTracks.put({
    videoId: item.videoId,
    blob,
    mimeType: blob.type || 'audio/mpeg',
    title: item.title,
    artist: item.artist,
    thumbnailUrl: item.thumbnailUrl,
    savedAt: Date.now(),
  })
}

export async function getOfflineTrack(videoId: string) {
  return appDb.offlineTracks.get(videoId)
}

export async function isTrackOffline(videoId: string) {
  return Boolean(await appDb.offlineTracks.get(videoId))
}

export async function cacheLyrics(spotifyTrackId: string, payload: LyricsResponse) {
  await appDb.lyricsCache.put({
    spotifyTrackId,
    payload,
    savedAt: Date.now(),
  })
}

export async function getCachedLyrics(spotifyTrackId: string) {
  return appDb.lyricsCache.get(spotifyTrackId)
}

export async function saveSetting<T>(key: string, value: T) {
  await appDb.settings.put({ key, value })
}

export async function getSetting<T>(key: string) {
  const row = await appDb.settings.get(key)
  return (row?.value as T | undefined) ?? null
}
