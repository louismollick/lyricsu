"use client";
import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { ScrollArea } from "./ui/scroll-area";
import { type lines, type lyrics } from "~/server/db/schema";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

export default function ScrollingLyrics({
  lyrics,
}: {
  lyrics: LyricsWithLines;
}) {
  const { position, seek } = useSpotifyPlayer();
  const [activeLineNumber, setActiveLineNumber] = useState(-1);
  const itemsRef = useRef<Map<number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const newActiveLineNumber = lyrics.lines.findIndex((l, i) => {
      const lyricHasStarted = l.startTimeMs <= position;
      const nextLyricHasNotStarted =
        (lyrics.lines[i + 1]?.startTimeMs ?? Infinity) > position;
      return lyricHasStarted && nextLyricHasNotStarted;
    });
    if (newActiveLineNumber === activeLineNumber) return;
    itemsRef.current.get(newActiveLineNumber)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    setActiveLineNumber(newActiveLineNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics.lines, position]);

  return (
    <ScrollArea className="h-full rounded-md border p-4">
      {lyrics?.lines.map((line) => (
        <button
          key={line.lineNumber}
          className={cn("block select-text text-6xl", {
            "text-7xl": line.lineNumber === activeLineNumber,
          })}
          onClick={(e) => {
            e.stopPropagation();
            void seek(Number(line.startTimeMs));
          }}
          dir="auto"
          ref={(node) => {
            if (node) itemsRef.current.set(line.lineNumber, node);
            else itemsRef.current.delete(line.lineNumber);
          }}
        >
          {line.words}
        </button>
      ))}
    </ScrollArea>
  );
}
