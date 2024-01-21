import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { segmentLyricLine } from "~/lib/segmentLyricLine";
import { getLyricsBySpotifyTrackId } from "~/lib/spotify";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { lines, lyrics } from "~/server/db/schema";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

const createNewLyrics = async (spotifyTrackId: string) => {
  const lyricsFromAPI = await getLyricsBySpotifyTrackId(spotifyTrackId);

  if (!lyricsFromAPI) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: `Error response when querying lyrics for Spotify track ID ${spotifyTrackId}.`,
    });
  }

  const segmentedLyrics = {
    ...lyricsFromAPI.lyrics,
    lines: await Promise.all(
      lyricsFromAPI.lyrics.lines.map(async (line) => ({
        ...line,
        segmentation: await segmentLyricLine(line.words),
      })),
    ),
  };

  return await db.transaction(async (tx) => {
    const insertedLyrics = await tx.insert(lyrics).values({
      spotifyTrackId,
      syncType: segmentedLyrics.syncType,
    });

    await tx.insert(lines).values(
      segmentedLyrics.lines.map((l, lineNumber) => ({
        lineNumber,
        lyricsId: insertedLyrics.insertId,
        startTimeMs: Number(l.startTimeMs),
        words: l.words,
        segmentation: l.segmentation,
      })),
    );

    return await tx.query.lyrics.findFirst({
      where: eq(lyrics.spotifyTrackId, spotifyTrackId),
      with: {
        lines: true,
      },
    });
  });
};

const getExistingLyrics = async (spotifyTrackId: string) =>
  await db.query.lyrics.findFirst({
    where: eq(lyrics.spotifyTrackId, spotifyTrackId),
    with: {
      lines: true,
    },
  });

export const lyricsRouter = createTRPCRouter({
  getByTrackId: publicProcedure.input(z.string()).query(async ({ input }) => {
    const existingLyrics =
      (await getExistingLyrics(input)) ?? (await createNewLyrics(input));

    if (!existingLyrics) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: `Error when getting existing or creating new lyrics database object.`,
      });
    }

    return existingLyrics;
  }),
  resegmentLyricsByTrackId: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const existingLyrics = await db.query.lyrics.findFirst({
        where: eq(lyrics.spotifyTrackId, input),
        with: {
          lines: true,
        },
      });

      if (!existingLyrics) return;

      await Promise.all(
        existingLyrics.lines.map(async ({ lyricsId, lineNumber, words }) => {
          const segmentation = await segmentLyricLine(words);
          console.log(segmentation);
          await db
            .update(lines)
            .set({
              segmentation,
            })
            .where(
              and(
                eq(lines.lyricsId, lyricsId),
                eq(lines.lineNumber, lineNumber),
              ),
            );
        }),
      );
    }),
});

export type LyricsRouter = typeof lyricsRouter;
export type LyricsWithSegmentedLines =
  inferRouterOutputs<LyricsRouter>["getByTrackId"];
export type SegmentedLine = LyricsWithSegmentedLines["lines"][number];
