import { describe, expect, it } from 'vitest'
import { selectPlayableMediaUrl } from './video'

describe('selectPlayableMediaUrl', () => {
  it('prefers entries with audio/video mime', () => {
    const selected = selectPlayableMediaUrl([
      'https://i.ytimg.com/vi/test/maxresdefault.webp',
      'https://rr1---sn-example.googlevideo.com/videoplayback?mime=audio%2Fwebm',
    ])

    expect(selected).toBe(
      'https://rr1---sn-example.googlevideo.com/videoplayback?mime=audio%2Fwebm',
    )
  })

  it('filters out image mime even without extension', () => {
    const selected = selectPlayableMediaUrl([
      'https://example.com/resource?mime=image%2Fwebp',
      'https://example.com/resource?mime=video%2Fmp4',
    ])

    expect(selected).toBe('https://example.com/resource?mime=video%2Fmp4')
  })

  it('falls back to a non-image http url when mime is not provided', () => {
    const selected = selectPlayableMediaUrl([
      'https://i.ytimg.com/vi/test/hqdefault.jpg',
      'https://media.example.com/stream',
    ])

    expect(selected).toBe('https://media.example.com/stream')
  })
})
