import { describe, expect, it } from 'vitest'
import { calculateCandidateScore } from './spotify-match'

describe('calculateCandidateScore', () => {
  it('prefers close title and artist matches', () => {
    const score = calculateCandidateScore(
      {
        videoId: 'abc',
        title: 'YOASOBI アイドル',
        artist: 'YOASOBI',
        durationSec: 210,
        thumbnailUrl: '',
      },
      {
        trackId: 'sp1',
        name: 'アイドル',
        artists: ['YOASOBI'],
        durationMs: 210000,
        album: 'Idol',
        imageUrl: '',
      },
    )

    expect(score).toBeGreaterThan(0.7)
  })

  it('penalizes very different candidates', () => {
    const score = calculateCandidateScore(
      {
        videoId: 'abc',
        title: 'YOASOBI アイドル',
        artist: 'YOASOBI',
        durationSec: 210,
        thumbnailUrl: '',
      },
      {
        trackId: 'sp2',
        name: 'Classical Symphony No.5',
        artists: ['Unknown Artist'],
        durationMs: 480000,
        album: 'Classical',
        imageUrl: '',
      },
    )

    expect(score).toBeLessThan(0.2)
  })
})
