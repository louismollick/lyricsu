import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getLyricsBySpotifyTrackId } from "~/lib/spotify";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { lines, lyrics } from "~/server/db/schema";

export const lyricsRouter = createTRPCRouter({
  getByTrackId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const existingLyrics = await ctx.db.query.lyrics.findFirst({
        where: eq(lyrics.spotifyTrackId, input),
        with: {
          lines: true,
        },
      });

      if (existingLyrics) return existingLyrics;

      const lyricsFromAPI = await getLyricsBySpotifyTrackId(input);

      if (!lyricsFromAPI) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: `Error response when querying lyrics for Spotify track ID ${input}.`,
        });
      }

      const insertedLyrics = await ctx.db.transaction(async (tx) => {
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

      return insertedLyrics;
    }),
});
