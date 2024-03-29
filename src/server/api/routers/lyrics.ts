import { TRPCError, type inferRouterOutputs } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { lines, lyrics } from "~/server/db/schema";
import getSegmentedLyricsFromSpotifyId from "~/lib/spotify/getSegmentedLyricsFromSpotifyId";
import getYoutubeTrackFromSpotifyId from "~/lib/youtube/getYoutubeIdFromSpotifyId";
import { segmentLyricLine } from "~/lib/segmentation/segmentLyricLine";
import getSongUrlFromYoutubeId from "~/lib/youtube/getSongUrlFromYoutubeId";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

const createNewLyrics = async (spotifyTrackId: string) => {
  const startTime = performance.now();
  const [segmentedLyrics, youtubeTrack] = await Promise.all([
    getSegmentedLyricsFromSpotifyId(spotifyTrackId),
    getYoutubeTrackFromSpotifyId(spotifyTrackId),
  ]);

  const result = await db.transaction(async (tx) => {
    const [insertedLyrics] = await tx.insert(lyrics).values({
      spotifyTrackId,
      youtubeTrackId: youtubeTrack.youtubeId,
      songUrl: "",
      title: youtubeTrack.title,
      artists: youtubeTrack.artists?.map((artist) => artist.name).join(" "),
      thumbnailUrl: youtubeTrack.thumbnailUrl,
      syncType: segmentedLyrics.syncType,
    }).returning({ insertedId: lyrics.id })

    if (!insertedLyrics?.insertedId) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: `Error when inserting lyrics.`,
    });

    await tx.insert(lines).values(
      segmentedLyrics.lines.map((l, lineNumber) => ({
        lineNumber,
        lyricsId: insertedLyrics.insertedId,
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
  console.log(`Finished createNewLyrics in ${performance.now() - startTime} milliseconds.`)
  return result
};

const getExistingLyrics = async (spotifyTrackId: string) => {
  const startTime = performance.now();
  const result = await db.query.lyrics.findFirst({
    where: eq(lyrics.spotifyTrackId, spotifyTrackId),
    with: {
      lines: {
        orderBy: [asc(lines.lineNumber)]
      },
    },
  });
  console.log(`Finished getExistingLyrics in ${performance.now() - startTime} milliseconds.`)
  return result
}

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

    const songUrl = await getSongUrlFromYoutubeId(
      existingLyrics.youtubeTrackId,
    );

    return [existingLyrics, songUrl] as const;
  }),
  resegmentLyricsByTrackId: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
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
  inferRouterOutputs<LyricsRouter>["getByTrackId"][0];
export type SegmentedLine = LyricsWithSegmentedLines["lines"][number];
