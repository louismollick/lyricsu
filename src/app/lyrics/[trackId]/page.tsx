import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
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
  const session = await getServerAuthSession();
  const lyrics = await api.lyrics.getByTrackId.query(trackId);

  if (!session) {
    return (
      <Button asChild>
        <Link href="/api/auth/signin">Sign in</Link>
      </Button>
    );
  }

  if (!lyrics) return "No Lyrics";

  return (
    <>
      <ScrollingLyrics lyrics={lyrics} />
      <Player trackUri={`spotify:track:${trackId}`} />
    </>
  );
}
