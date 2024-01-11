import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import createWordSegmentation from "~/defer/createWordSegmentation";
import childProcess from "child_process";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

const test = () => {
  const output = childProcess.spawnSync("./ichiran-cli", ["--help"], {
    encoding: "utf8",
  });
  console.log("NORMAL OUTPUT: " + output.stdout);
  console.log("NORMAL ERROR: " + JSON.stringify(output.error));
};

export default async function Lyrics() {
  await createWordSegmentation();
  test();
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
