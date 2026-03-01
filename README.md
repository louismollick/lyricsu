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
- `ytmusic-api` for search/song metadata
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
- `SPOTIFY_LYRICS_API_URL` set to `https://lyrics.louismollick.com/api`

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
- `SPOTIFY_LYRICS_API_URL=https://lyrics.louismollick.com/api`

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
