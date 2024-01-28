import { type Metadata } from "next";
import Image from "next/image";
import PositionSlider from "~/components/positionSlider";
import VolumeControls from "~/components/volumeControls";
import YtMusicPlayer from "~/components/ytMusicPlayer";
import { api } from "~/trpc/server";
import { ScrollArea } from "~/components/ui/scroll-area";
import ScrollingLyrics from "~/components/scrollingLyrics";

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

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Lyrics({
  params: { trackId },
}: {
  params: { trackId: string };
}) {
  const [lyrics, youtubeTrack] = await Promise.all([
    api.lyrics.getByTrackId.query(trackId),
    api.lyrics.getYoutubeTrackFromSpotifyId.query(trackId),
  ]);

  if (!lyrics) return <p>Could not find Lyrics for this Spotify song.</p>;

  if (!youtubeTrack?.youtubeId) return <p>Could not find Youtube Id.</p>;

  return (
    <>
      {/* <SuspenseTrigger /> */}
      <ScrollArea
        className="flex h-full rounded-md border p-4"
        viewportClassName="before:block before:h-[calc(50%-30px)] before:content-[''] after:block after:h-[calc(50%-30px)] after:content-['']"
      >
        <ScrollingLyrics lyrics={lyrics} />
      </ScrollArea>
      <div className="flex h-20 justify-between gap-4 bg-gray-900 px-2 py-2 text-white md:px-4">
        <div className="flex flex-grow basis-0 items-center gap-2">
          <Image
            alt="Album Art"
            className="rounded-md object-cover"
            src={youtubeTrack?.thumbnailUrl ?? ""}
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width={64}
            height={64}
          />
          <div className="flex flex-col">
            <h3 className="truncate text-sm font-medium">
              {youtubeTrack?.title}
            </h3>
            <p className="truncate text-xs">
              {youtubeTrack?.artists?.map((artist) => artist.name).join(" ")}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <YtMusicPlayer youtubeId={youtubeTrack?.youtubeId} />
          <PositionSlider />
        </div>

        <div className="hidden flex-grow basis-0 items-center justify-end md:flex">
          <VolumeControls />
        </div>
      </div>
    </>
  );
}
