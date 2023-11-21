import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import ScrollingLyrics from "~/components/scrollingLyrics";
import Player from "~/components/player";
import { api } from "~/trpc/server";

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

  return (
    <>
      <div className="container h-full min-h-0 py-12">
        <ScrollingLyrics lyrics={lyrics} />
      </div>
      <Player trackUri={`spotify:track:${trackId}`} />
    </>
  );
}
