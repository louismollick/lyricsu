import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import createWordSegmentation from "~/defer/createWordSegmentation";
import childProcess from "child_process";
import path from "path";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

const test = () => {
  try {
    const cmd = path.join(process.cwd(), "src/defer/ichiran-cli");
    const output = childProcess.spawnSync(cmd, ["--help"], {
      encoding: "utf8",
    });
    console.log("NORMAL OUTPUT: " + output.stdout);
    console.log("NORMAL ERROR: " + JSON.stringify(output.error));
  } catch (error) {
    console.log("NORMAL THROWS: " + JSON.stringify(error));
  }
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
