import { describe, expect, it } from 'vitest'
import { buildYoutubeCookieHeaderFromNetscapeFile } from './youtubei'

describe('buildYoutubeCookieHeaderFromNetscapeFile', () => {
  it('extracts youtube cookies from a Netscape cookies.txt export', () => {
    const header = buildYoutubeCookieHeaderFromNetscapeFile(
      [
        '# Netscape HTTP Cookie File',
        '.youtube.com\tTRUE\t/\tTRUE\t4102444800\tLOGIN_INFO\tlogin',
        '.youtube.com\tTRUE\t/\tTRUE\t4102444800\t__Secure-3PAPISID\tsecure-3p',
        '.youtube.com\tTRUE\t/\tTRUE\t1\tYSC\tstale',
        '.google.com\tTRUE\t/\tTRUE\t4102444800\tLOGIN_INFO\tignore-me',
        'music.youtube.com\tFALSE\t/\tTRUE\t4102444800\tVISITOR_INFO1_LIVE\tvisitor',
      ].join('\n'),
    )

    expect(header).toBe(
      [
        'LOGIN_INFO=login',
        '__Secure-3PAPISID=secure-3p',
        'VISITOR_INFO1_LIVE=visitor',
        'SAPISID=secure-3p',
      ].join('; '),
    )
  })

  it('returns undefined when no supported cookies are present', () => {
    expect(
      buildYoutubeCookieHeaderFromNetscapeFile(
        [
          '# Netscape HTTP Cookie File',
          '.google.com\tTRUE\t/\tTRUE\t4102444800\tSID\tignore-me',
        ].join('\n'),
      ),
    ).toBeUndefined()
  })
})
