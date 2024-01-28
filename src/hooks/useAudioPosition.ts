"use client";

import { useEffect, useState } from "react";
import { useGlobalAudioPlayer } from "react-use-audio-player";
import { useInterval } from "./useInterval";

const TICK_INTERVAL = 200; // ms

export default function useAudioPosition() {
  const [pos, setPos] = useState(0);
  const { getPosition } = useGlobalAudioPlayer();
  const { startInterval } = useInterval();

  useEffect(() => {
    startInterval(() => setPos(getPosition()), TICK_INTERVAL);
  }, [getPosition, startInterval]);

  return pos;
}
