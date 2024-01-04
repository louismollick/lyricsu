"use client";
import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";
import { type LyricsRouter } from "~/server/api/routers/lyrics";
import { type inferRouterOutputs } from "@trpc/server";

export default function ScrollingLyrics({
  lyrics,
}: {
  lyrics: inferRouterOutputs<LyricsRouter>["getByTrackId"];
}) {
  const { position, seek } = useSpotifyPlayer();
  const [activeLineNumber, setActiveLineNumber] = useState(-1);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const newActiveLineNumber = lyrics.lines.findIndex((l, i) => {
      const lineHasStarted = l.startTimeMs <= position;
      const nextLineHasntStarted =
        (lyrics.lines[i + 1]?.startTimeMs ?? Infinity) > position;
      return lineHasStarted && nextLineHasntStarted;
    });
    if (newActiveLineNumber === activeLineNumber) return;
    itemsRef.current.get(newActiveLineNumber)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    setActiveLineNumber(newActiveLineNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics.lines.length, position]);

  return (
    <ScrollArea
      className="flex h-full rounded-md border p-4"
      viewportClassName="before:block before:h-[calc(50%-30px)] before:content-[''] after:block after:h-[calc(50%-30px)] after:content-['']"
    >
      {lyrics.lines.map((line) => (
        <span
          key={line.lineNumber}
          className={cn("block select-text text-6xl text-slate-700", {
            "text-text-white": line.lineNumber === activeLineNumber,
          })}
          onClick={(e) => {
            if (line.lineNumber === activeLineNumber) return;
            e.stopPropagation();
            void seek(Number(line.startTimeMs));
          }}
          dir="auto"
          ref={(node) => {
            if (node) itemsRef.current.set(line.lineNumber, node);
            else itemsRef.current.delete(line.lineNumber);
          }}
        >
          {line.segmentation.map((wordChain, chainIdx) => {
            if (typeof wordChain === "string")
              return <span key={`chain-${chainIdx}`}>{wordChain}</span>;

            const [[words]] = wordChain;
            return words.map((word, wordIdx) => {
              const [romanji, wordAlternatives] = word;

              const wordReading =
                "alternative" in wordAlternatives
                  ? wordAlternatives.alternative[0] // just take the first one
                  : wordAlternatives;

              return (
                <span
                  key={`chain-${chainIdx}-word-${wordIdx}`}
                >{`${wordReading?.text} (${romanji})`}</span>
              );
            });
          }) ?? "An issue occured with displaying segmented lyric line."}
        </span>
      ))}
    </ScrollArea>
  );
}
