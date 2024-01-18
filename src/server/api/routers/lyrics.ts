import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { segmentLyricLine } from "~/lib/segmentLyrics";
// import { triggerSegmentLyrics } from "~/lib/ichiran";
import { getLyricsBySpotifyTrackId } from "~/lib/spotify";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { lines, lyrics } from "~/server/db/schema";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

export const lyricsRouter = createTRPCRouter({
  getByTrackId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      let existingLyrics = await ctx.db.query.lyrics.findFirst({
        where: eq(lyrics.spotifyTrackId, input),
        with: {
          lines: true,
        },
      });

      if (!existingLyrics) {
        const lyricsFromAPI = await getLyricsBySpotifyTrackId(input);

        if (!lyricsFromAPI) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: `Error response when querying lyrics for Spotify track ID ${input}.`,
          });
        }

        existingLyrics = await ctx.db.transaction(async (tx) => {
          const insertedLyrics = await tx.insert(lyrics).values({
            spotifyTrackId: input,
            syncType: lyricsFromAPI.lyrics.syncType,
          });

          await tx.insert(lines).values(
            lyricsFromAPI.lyrics.lines.map((l, lineNumber) => ({
              lineNumber,
              lyricsId: insertedLyrics.insertId,
              startTimeMs: Number(l.startTimeMs),
              words: l.words,
            })),
          );

          return await tx.query.lyrics.findFirst({
            where: eq(lyrics.spotifyTrackId, input),
            with: {
              lines: true,
            },
          });
        });
      }

      if (!existingLyrics) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: `Error when getting existing or creating new lyrics database object.`,
        });
      }

      const segmentedLyrics = {
        ...existingLyrics,
        lines: await Promise.all(
          existingLyrics.lines.map(async (line) => ({
            ...line,
            segmentation: await segmentLyricLine(line.words),
          })),
        ),
      };

      await Promise.all(
        segmentedLyrics.lines.map(({ segmentation, lyricsId, lineNumber }) =>
          db
            .update(lines)
            .set({
              segmentation,
            })
            .where(
              and(
                eq(lines.lyricsId, lyricsId),
                eq(lines.lineNumber, lineNumber),
              ),
            ),
        ),
      );

      return segmentedLyrics;
    }),
});

export type LyricsRouter = typeof lyricsRouter;
export type LyricsWithSegmentedLines =
  inferRouterOutputs<LyricsRouter>["getByTrackId"];
export type SegmentedLine = LyricsWithSegmentedLines["lines"][number];
