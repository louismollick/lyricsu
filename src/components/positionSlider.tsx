"use client";
import React from "react";
import { Slider } from "./ui/slider";
import { useGlobalAudioPlayer } from "react-use-audio-player";
import useAudioPosition from "~/hooks/useAudioPosition";
import { toHHMMSS } from "~/lib/utils";

const PositionSlider = () => {
  const { duration, seek } = useGlobalAudioPlayer();
  const position = useAudioPosition();
  const positionHHMMSS = toHHMMSS(position);
  const durationHHMMSS = toHHMMSS(duration);

  return (
    <div className="hidden w-96 md:flex">
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
  );
};

export default PositionSlider;
