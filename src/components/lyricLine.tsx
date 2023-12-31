"use client";
import React, { forwardRef } from "react";

import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { cn } from "~/lib/utils";
import { type SegmentedLine } from "~/server/api/routers/lyrics";
import WordReadingHoverCard from "./wordReadingHoverCard";

type Ref = HTMLSpanElement;
type Props = {
  line: SegmentedLine;
  active: boolean;
};

export default forwardRef<Ref, Props>(function LyricLine(
  { line, active },
  ref,
) {
  const { seek } = useSpotifyPlayer();
  return (
    <span
      key={line.lineNumber}
      className={cn("block select-text text-6xl text-slate-700", {
        "text-text-white": active,
      })}
      onClick={(e) => {
        if (active) return; // Don't restart current line if you tap it
        e.stopPropagation();
        void seek(Number(line.startTimeMs));
      }}
      dir="auto"
      ref={ref}
    >
      {line.segmentation.map((wordChain, chainIdx) => {
        if (typeof wordChain === "string")
          return <span key={`chain-${chainIdx}`}>{wordChain}</span>;

        const [[words]] = wordChain;
        return words.map((word, wordIdx) => {
          const [romanji, wordAlternatives] = word;

          const wordReading =
            "alternative" in wordAlternatives
              ? wordAlternatives.alternative[0]! // just take the first one
              : wordAlternatives;

          return (
            <WordReadingHoverCard
              key={`chain-${chainIdx}-word-${wordIdx}`}
              wordReading={wordReading}
              romanji={romanji}
            />
          );
        });
      }) ?? "An issue occured with displaying segmented lyric line."}
    </span>
  );
});
