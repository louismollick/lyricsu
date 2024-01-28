"use client";
import React from "react";
import { Button } from "./ui/button";
import { SpeakerLoudIcon, SpeakerOffIcon } from "@radix-ui/react-icons";
import { Slider } from "./ui/slider";
import { useGlobalAudioPlayer } from "react-use-audio-player";

const VolumeControls = () => {
  const { isReady, isLoading, muted, mute, setVolume } = useGlobalAudioPlayer();

  return (
    <>
      <Button onClick={() => mute(!muted)} size="icon" variant="ghost">
        {isReady && !isLoading && muted ? (
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
    </>
  );
};

export default VolumeControls;
