"use client";
import { useEffect, type JSX, type SVGProps, useCallback } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useGlobalAudioPlayer } from "react-use-audio-player";
import useAudioPosition from "~/hooks/useAudioPosition";
import { Slider } from "./ui/slider";
import useKeypress from "~/hooks/useKeyPress";
import { toHHMMSS } from "~/lib/utils";

export default function Player({ songUrl }: { songUrl: string }) {
  const { load, play, pause, playing, duration, seek } = useGlobalAudioPlayer();
  const position = useAudioPosition();
  const positionHHMMSS = toHHMMSS(position);
  const durationHHMMSS = toHHMMSS(duration);

  const togglePlay = useCallback(
    () => (playing ? pause() : play()),
    [pause, play, playing],
  );

  useKeypress(" ", togglePlay);

  useEffect(() => {
    console.log("loading!!!!");
    load(songUrl, {
      autoplay: true,
    });
  }, [load, songUrl]);

  return (
    <div className="flex justify-between gap-4 bg-gray-900 px-4 py-2 text-white">
      <div className="flex items-center">
        <Image
          alt="Album Art"
          className="rounded-md object-cover"
          height={50}
          src="/placeholder.svg"
          style={{
            aspectRatio: "50/50",
            objectFit: "cover",
          }}
          width={50}
        />
        <div className="flex flex-col">
          <h3 className="truncate text-sm font-medium">Track Title</h3>
          <p className="truncate text-xs">Artist Name</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-center gap-2">
          <Button size="icon" variant="ghost">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button onClick={togglePlay} size="icon" variant="ghost">
            {playing ? (
              <>
                <PauseIcon className="h-5 w-5" />
                <span className="sr-only">Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                <span className="sr-only">Play</span>
              </>
            )}
          </Button>
          <Button size="icon" variant="ghost">
            <ArrowRightIcon className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        <div className="flex w-96">
          <Slider
            className="w-full shrink-0"
            onValueChange={([value]) => seek(value ?? 0)}
            min={0}
            value={[position]}
            max={duration}
          />
          <div className="flex-grow-0 text-nowrap p-2 text-xs">
            {positionHHMMSS} / {durationHHMMSS}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <Button size="icon" variant="ghost">
          <VolumeIcon className="h-5 w-5" />
          <span className="sr-only">Volume</span>
        </Button>
        <Slider
          className="w-20"
          defaultValue={[100]}
          id="volume"
          max={100}
          min={0}
        />
      </div>
    </div>
  );
}

function ArrowLeftIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// function HeartIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
//     </svg>
//   );
// }

// function RepeatIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m17 2 4 4-4 4" />
//       <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
//       <path d="m7 22-4-4 4-4" />
//       <path d="M21 13v1a4 4 0 0 1-4 4H3" />
//     </svg>
//   );
// }

function PlayIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="4" height="16" x="6" y="4" />
      <rect width="4" height="16" x="14" y="4" />
    </svg>
  );
}

function VolumeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
