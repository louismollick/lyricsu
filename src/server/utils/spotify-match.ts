import type { SongSearchItem, SpotifyMatchCandidate } from '../../lib/types/api'

const NORMALIZE_PATTERN = /[^\p{L}\p{N}]+/gu

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(NORMALIZE_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
}

function jaccardSimilarity(left: string, right: string) {
  const leftSet = new Set(tokenize(left))
  const rightSet = new Set(tokenize(right))
  if (leftSet.size === 0 || rightSet.size === 0) return 0

  let overlap = 0
  for (const token of leftSet) {
    if (rightSet.has(token)) overlap += 1
  }

  return overlap / (leftSet.size + rightSet.size - overlap)
}

function durationScore(videoDurationSec: number | null, trackDurationMs: number) {
  if (!videoDurationSec || trackDurationMs <= 0) return 0.5

  const diff = Math.abs(videoDurationSec * 1000 - trackDurationMs)
  const maxDiff = 15000
  return Math.max(0, 1 - diff / maxDiff)
}

export function calculateCandidateScore(
  video: SongSearchItem,
  candidate: Omit<SpotifyMatchCandidate, 'score'>,
) {
  const title = jaccardSimilarity(video.title, candidate.name)
  const artist = jaccardSimilarity(video.artist, candidate.artists.join(' '))
  const duration = durationScore(video.durationSec ?? null, candidate.durationMs)

  return Number((title * 0.55 + artist * 0.35 + duration * 0.1).toFixed(4))
}
