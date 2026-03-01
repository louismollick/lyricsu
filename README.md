# Lyricsu

Mobile-first Japanese music listening app built with TanStack Start + React + TypeScript.

Core features:
- URL-driven playback via `/watch?v=<youtubeVideoId>`
- Rich search suggestions from YouTube Music
- Synced lyrics with tap-to-seek and scroll-to-seek
- Yomitan dictionary lookup on tapped Japanese tokens
- Offline track fallback using Dexie/IndexedDB
- PWA support

## Stack
- TanStack Start (React)
- Tailwind CSS + shadcn-style UI components
- `youtubei.js` for YouTube Music search/song metadata
- `ytdlp-nodejs` for media streaming/download
- `@spotify/web-api-ts-sdk` for Spotify track matching
- hosted Spotify lyrics API for synced lyrics
- `yomitan-core` for dictionary/tokenization/rendered popup lookup

## Environment
Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_LYRICS_API_URL` set to `https://spotify-lyrics-api.louismollick.com/` for public deployments

Optional for reliable YouTube access on server deployments:
- `YTDLP_COOKIES_PATH` pointing to a mounted Netscape-format `cookies.txt` file

To generate the cookie file, follow the official `yt-dlp` guide:
- [yt-dlp FAQ: How do I pass cookies to yt-dlp?](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)

This app prefers a mounted `cookies.txt` file. When `YTDLP_COOKIES_PATH` is set, both `yt-dlp` and `youtubei.js` use that same file.

## Local Development
```bash
pnpm install
pnpm dev
```

## Quality Checks
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Note: Vitest currently prints a non-fatal hanging-process warning after tests complete.

## Deployment (Vercel)
Deploy the TanStack Start app to Vercel as a standard Node.js project.

Set these project environment variables in Vercel:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_LYRICS_API_URL=https://spotify-lyrics-api.louismollick.com/`

If you deploy to a custom Node host or Docker instead of Vercel, also mount a YouTube `cookies.txt` file and set `YTDLP_COOKIES_PATH` to that in-container path.

Then deploy with Vercel using the detected build settings for the repo.

## Important Routes
- `/` search page
- `/watch?v=<videoId>` player page
- `/settings` Yomitan dictionary management

## API Routes
- `GET /api/search/suggestions?q=<query>&limit=<n>`
- `GET /api/lyrics/match/:videoId`
- `GET /api/lyrics/track/:spotifyTrackId`
- `GET /api/media/stream/:videoId`
- `GET /api/media/download/:videoId`
- `GET /api/health`
