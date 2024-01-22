"use client";
import { useEffect, useCallback, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useGlobalAudioPlayer } from "react-use-audio-player";
import useAudioPosition from "~/hooks/useAudioPosition";
import { Slider } from "./ui/slider";
import useKeypress from "~/hooks/useKeyPress";
import { toHHMMSS } from "~/lib/utils";
import { getSongFromYouTube } from "~/lib/youtube";
import { type YoutubeTrack } from "~/server/api/routers/lyrics";
import {
  PlayIcon,
  PauseIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";

export default function Player({
  youtubeTrack,
}: {
  youtubeTrack: YoutubeTrack;
}) {
  const { load, play, pause, playing, duration, seek, setVolume, mute, muted } =
    useGlobalAudioPlayer();
  const [ytSongUrl, setYtSongUrl] = useState<string>();
  const position = useAudioPosition();
  const positionHHMMSS = toHHMMSS(position);
  const durationHHMMSS = toHHMMSS(duration);

  const togglePlay = useCallback(
    () => (playing ? pause() : play()),
    [pause, play, playing],
  );

  useKeypress(" ", togglePlay);

  useEffect(() => {
    void getSongFromYouTube(youtubeTrack?.youtubeId).then((song) =>
      setYtSongUrl(song?.fileUrl),
    );
  }, [youtubeTrack?.youtubeId]);

  useEffect(() => {
    console.log("loading!!!!", ytSongUrl);
    if (!ytSongUrl) return;
    load(ytSongUrl, {
      autoplay: true,
      format: "m4a",
    });
  }, [load, ytSongUrl]);

  return (
    <div className="flex justify-between gap-4 bg-gray-900 px-4 py-2 text-white">
      <div className="flex flex-grow basis-0 items-center gap-2">
        <Image
          alt="Album Art"
          className="rounded-md object-cover"
          src={youtubeTrack?.thumbnailUrl ?? ""}
          style={{
            aspectRatio: "50/50",
            objectFit: "cover",
          }}
          width={70}
          height={70}
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

      <div className="flex flex-col">
        <div className="flex justify-center gap-2">
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

      <div className="flex flex-grow basis-0 items-center justify-end">
        <Button onClick={() => mute(!muted)} size="icon" variant="ghost">
          {muted ? (
            <>
              <SpeakerOffIcon className="h-5 w-5" />
              <span className="sr-only">Unmute</span>
            </>
          ) : (
            <>
              <SpeakerLoudIcon className="h-5 w-5" />
              <span className="sr-only">Mute</span>
            </>
          )}
        </Button>
        <Slider
          className="w-20"
          defaultValue={[1]}
          onValueChange={([value]) => setVolume(value ?? 1)}
          id="volume"
          max={1}
          min={0}
          step={0.01}
        />
      </div>
    </div>
  );
}
