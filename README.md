# Lyricsu

Read word-by-word translations of Japanese lyrics while listening to your favorite songs! 

### How it works

- Built using T3 stack (Typescript/Tailwind/Next.js/TRPC/etc.)
- Deployed to AWS using SST/OpenNext
- Get synced lyrics from Spotify (actually Musixmatch)
- Segment/Translate each word in Japanese lyric using an Ichiran executable
- Search YoutubeMusic for same song name & artist to find YoutubeId
- Use `youtube-dl` to obtain the base64 song url
- Uses React, `Howler.js`, tailwind to display the lyrics scrolling in-sync with music, with popup for each word translaton in lyrics

# Commands

./start-database.sh
npm run db:push
npm run dev