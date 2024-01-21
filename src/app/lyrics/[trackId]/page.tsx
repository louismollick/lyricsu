import { type Metadata } from "next";
import Player from "~/components/player";
import { api } from "~/trpc/server";
import ScrollingLyrics from "~/components/scrollingLyrics";

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

  if (!lyrics) return "No Lyrics";

  return (
    <>
      <ScrollingLyrics lyrics={lyrics} />
      <Player
        songUrl="/potage.mp3"
        // trackUri={`spotify:track:${trackId}`}
      />
    </>
  );
}
