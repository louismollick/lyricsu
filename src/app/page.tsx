import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function Lyrics() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <Button asChild>
        <Link href="/api/auth/signin">Sign in</Link>
      </Button>
    );
  }

  return <>Hi</>;
}
