"use client";
import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { useEffect, useRef, useState } from "react";
import { type LyricsWithSegmentedLines } from "~/server/api/routers/lyrics";

import { ScrollArea } from "~/components/ui/scroll-area";
import LyricLine from "./lyricLine";

export default function ScrollingLyrics({
  lyrics,
}: {
  lyrics: LyricsWithSegmentedLines;
}) {
  const { position } = useSpotifyPlayer();
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
        <LyricLine
          key={line.lineNumber}
          line={line}
          active={line.lineNumber === activeLineNumber}
          ref={(node) => {
            if (node) itemsRef.current.set(line.lineNumber, node);
            else itemsRef.current.delete(line.lineNumber);
          }}
        />
      ))}
    </ScrollArea>
  );
}
