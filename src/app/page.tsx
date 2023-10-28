import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import Player from "./_components/player";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function Home() {
  const session = await getServerAuthSession();
  const secretMessage = session?.user
    ? await api.post.getSecretMessage.query()
    : "";

  return (
    <>
      <main className="container flex min-h-screen min-w-full flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col items-center justify-center gap-12 px-4 pt-16">
          <p className="text-center text-2xl text-white">
            {session && `Logged in as ${session.user?.name}`}
          </p>
          <p className="text-l text-white">
            {`It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using Content here, content
            here, making it look like readable English. Many desktop publishing
            packages and web page editors now use Lorem Ipsum as their default
            model text, and a search for 'lorem ipsum' will uncover many web
            sites still in their infancy. Various versions have evolved over the
            years, sometimes by accident, sometimes on purpose (injected humour
            and the like`}
          </p>
          <p className="text-center text-2xl text-white">
            {session && ` - ${secretMessage}`}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
        <div className="mt-auto">
          <Player
            trackUri={`spotify:track:6n9AvpTLSNunpIr2Gr2AXa`} //${currentTrack.spotifyId}
          />
        </div>
      </main>
    </>
  );
}
