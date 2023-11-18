"use client";
import { useCallback, useEffect, useRef } from "react";

export const useInterval = () => {
  const interval = useRef<NodeJS.Timeout>();

  const stopInterval = useCallback(() => {
    if (!interval.current) return;
    clearInterval(interval.current);
  }, []);

  const startInterval = useCallback(
    (cb: () => void, period: number | undefined) => {
      if (interval.current) {
        stopInterval();
      }
      interval.current = setInterval(cb, period);
    },
    [stopInterval],
  );

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, [stopInterval]);

  return {
    startInterval,
    stopInterval,
  };
};
