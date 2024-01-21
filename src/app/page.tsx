import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Lyrics() {
  return <>Hi</>;
}
