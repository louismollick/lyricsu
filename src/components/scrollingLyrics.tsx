"use client";
import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { ScrollArea } from "./ui/scroll-area";
import { type lines, type lyrics } from "~/server/db/schema";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

export default function ScrollingLyrics({
  lyrics,
}: {
  lyrics?: LyricsWithLines;
}) {
  const { position } = useSpotifyPlayer();

  if (!lyrics) return "No Lyrics";

  return (
    <ScrollArea className="h-full rounded-md border p-4">
      {lyrics.lines.map((l) => (
        <div
          className={l.startTimeMs < position ? "text-6xl" : ""}
          key={l.lineNumber}
        >
          {`${l.startTimeMs}: ${l.words}`}
        </div>
      ))}
    </ScrollArea>
  );
}
