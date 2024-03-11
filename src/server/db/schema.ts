import { relations } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { type IchiranResponse } from "~/types/ichiran";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `lyricsu_${name}`);

export const lyrics = createTable(
  "lyrics",
  {
    id: serial("id").primaryKey(),
    syncType: varchar("sync_type", { length: 255 }),
    youtubeTrackId: varchar("youtube_track_id", { length: 255 })
      .notNull()
      .unique(),
    spotifyTrackId: varchar("spotify_track_id", { length: 255 })
      .notNull()
      .unique(),
    songUrl: varchar("song_url", { length: 2047 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 2047 }),
    title: varchar("title", { length: 255 }),
    artists: varchar("artists", { length: 255 }),
  },
  (lyrics) => ({
    spotifyTrackIdIdx: index("spotify_track_id_idx").on(lyrics.spotifyTrackId),
  }),
);

export const lyricsRelations = relations(lyrics, ({ many }) => ({
  lines: many(lines),
}));

// id3 format from https://github.com/akashrchandran/spotify-lyrics-api
export const lines = createTable(
  "lyrics_line",
  {
    lyricsId: serial("lyrics_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    startTimeMs: integer("start_time_ms").notNull().default(0),
    words: varchar("words", { length: 255 }).notNull(),
    segmentation: json("json").$type<IchiranResponse>().default([]).notNull(),
  },
  (line) => ({
    compoundKey: primaryKey({ columns: [line.lyricsId, line.lineNumber] }),
  }),
);

export const linesRelations = relations(lines, ({ one }) => ({
  lyric: one(lyrics, {
    fields: [lines.lyricsId],
    references: [lyrics.id],
  }),
}));