import { type Metadata } from "next";
import Player from "~/components/player";
import { api } from "~/trpc/server";
import ScrollingLyrics from "~/components/scrollingLyrics";
import { Suspense } from "react";
import Loading from "./loading";

// const SuspenseTrigger = () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   throw new Promise(() => {});
// };

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function Lyrics({
  params: { trackId },
}: {
  params: { trackId: string };
}) {
  const lyrics = await api.lyrics.getByTrackId.query(trackId);
  const youtubeTrack =
    await api.lyrics.getYoutubeTrackFromSpotifyId.query(trackId);

  if (!lyrics) return "Could not find Lyrics for this Spotify song.";

  if (!youtubeTrack?.youtubeId)
    return "Could not find Youtube track for this Spotify song.";

  return (
    <Suspense fallback={<Loading />}>
      {/* <SuspenseTrigger /> */}
      <ScrollingLyrics lyrics={lyrics} />
      <Player youtubeTrack={youtubeTrack} />
    </Suspense>
  );
}
