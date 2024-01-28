"use client";
import React, { useEffect } from "react";
import { useGlobalAudioPlayer } from "react-use-audio-player";
import useKeypress from "~/hooks/useKeyPress";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./loadingSpinner";
import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";

const PlayerControls = ({ songUrl }: { songUrl: string }) => {
  const { isReady, load, togglePlayPause, playing } = useGlobalAudioPlayer();

  useKeypress(" ", togglePlayPause);

  useEffect(() => {
    load(songUrl, {
      format: "m4a",
    });
  }, [load, songUrl]);

  return (
    <div className="flex justify-center gap-2">
      <Button onClick={togglePlayPause} size="icon" variant="ghost">
        {!isReady ? (
          <LoadingSpinner />
        ) : playing ? (
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
  );
};

export default PlayerControls;
