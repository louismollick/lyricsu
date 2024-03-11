"use client";
import React, { forwardRef } from "react";

import { cn } from "~/lib/utils";
import { type SegmentedLine } from "~/server/api/routers/lyrics";
import WordReadingPopover from "./wordReadingPopover";
import { useGlobalAudioPlayer } from "react-use-audio-player";

type Ref = HTMLSpanElement;
type Props = {
  line: SegmentedLine;
  active: boolean;
};

export default forwardRef<Ref, Props>(function LyricLine(
  { line, active },
  ref,
) {
  const { seek } = useGlobalAudioPlayer();
  return (
    <span
      key={line.lineNumber}
      className={cn(
        "block select-text text-2xl text-slate-700 md:text-4xl lg:text-6xl",
        {
          "text-text-white": active,
        },
      )}
      onClick={(e) => {
        if (active) return; // Don't restart current line if you tap it
        e.stopPropagation();
        void seek(Number(line.startTimeMs) / 1000);
      }}
      dir="auto"
      ref={ref}
    >
      {line.segmentation.length
        ? line.segmentation.map((wordChain, chainIdx) => {
            if (typeof wordChain === "string")
              return <span key={`chain-${chainIdx}`}>{wordChain}</span>;

            const [[words]] = wordChain;
            return words.map((word, wordIdx) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const [_, wordAlternatives] = word;

              const wordReading =
                "alternative" in wordAlternatives
                  ? wordAlternatives.alternative[0]! // just take the first one
                  : wordAlternatives;

              return (
                <WordReadingPopover
                  key={`chain-${chainIdx}-word-${wordIdx}`}
                  wordReading={wordReading}
                />
              );
            });
          })
        : line.words}
    </span>
  );
});
