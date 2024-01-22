"use client";
import { useEffect, useRef, useState } from "react";
import { type LyricsWithSegmentedLines } from "~/server/api/routers/lyrics";

import LyricLine from "./lyricLine";
import useAudioPosition from "~/hooks/useAudioPosition";
import ScrollContainer from "./scrollContainer";

export default function ScrollingLyrics({
  lyrics,
}: {
  lyrics: LyricsWithSegmentedLines;
}) {
  const position = useAudioPosition() * 1000;
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
    <ScrollContainer>
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
    </ScrollContainer>
  );
}
