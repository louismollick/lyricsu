import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import { type lyrics, type lines } from "~/server/db/schema";
import { type IchiranResponse } from "~/types/ichiran";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

export const getSentenceSegmentation = async (sentence: string) => {
  const url = `${env.ICHIRAN_URL}/${encodeURI(sentence)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: `${url} ${res.status} ${res.statusText}`,
    });
  }

  return (await res.json()) as IchiranResponse;
};

export const getLyricsPlusSegmentation = async (lyrics: LyricsWithLines) => ({
  ...lyrics,
  lines: await Promise.all(
    lyrics.lines.map(async (line) => ({
      ...line,
      segmentation: await getSentenceSegmentation(line.words),
    })),
  ),
});
