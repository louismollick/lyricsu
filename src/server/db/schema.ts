import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  pgTableCreator,
  primaryKey,
  serial,
  text,
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

/**
 * Jmdict tables generated in Ichiran setup
 */

export const conjSourceReading = pgTable("conj_source_reading", {
	id: serial("id").primaryKey().notNull(),
	conjId: integer("conj_id").notNull().references(() => conjugation.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
	sourceText: text("source_text").notNull(),
},
(table) => {
	return {
		conjIdTextIdx: index().on(table.conjId, table.text),
	}
});

export const entry = pgTable("entry", {
	seq: integer("seq").primaryKey().notNull(),
	content: text("content").notNull(),
	rootP: boolean("root_p").notNull(),
	nKanji: integer("n_kanji").notNull(),
	nKana: integer("n_kana").notNull(),
	primaryNokanji: boolean("primary_nokanji").notNull(),
});

export const gloss = pgTable("gloss", {
	id: serial("id").primaryKey().notNull(),
	senseId: integer("sense_id").notNull().references(() => sense.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
	ord: integer("ord").notNull(),
},
(table) => {
	return {
		senseIdIdx: index().on(table.senseId),
	}
});

export const kanaText = pgTable("kana_text", {
	id: serial("id").primaryKey().notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
	ord: integer("ord").notNull(),
	common: integer("common"),
	commonTags: text("common_tags").notNull(),
	conjugateP: boolean("conjugate_p").notNull(),
	nokanji: boolean("nokanji").notNull(),
	bestKanji: text("best_kanji"),
},
(table) => {
	return {
		commonIdx: index().on(table.common),
		ordIdx: index().on(table.ord),
		seqIdx: index().on(table.seq),
		textIdx: index().on(table.text),
	}
});

export const kanjiText = pgTable("kanji_text", {
	id: serial("id").primaryKey().notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
	ord: integer("ord").notNull(),
	common: integer("common"),
	commonTags: text("common_tags").notNull(),
	conjugateP: boolean("conjugate_p").notNull(),
	nokanji: boolean("nokanji").notNull(),
	bestKana: text("best_kana"),
},
(table) => {
	return {
		commonIdx: index().on(table.common),
		ordIdx: index().on(table.ord),
		seqIdx: index().on(table.seq),
		textIdx: index().on(table.text),
	}
});

export const reading = pgTable("reading", {
	id: serial("id").primaryKey().notNull(),
	kanjiId: integer("kanji_id").notNull().references(() => kanji.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	type: text("type").notNull(),
	text: text("text").notNull(),
	suffixp: boolean("suffixp").notNull(),
	prefixp: boolean("prefixp").notNull(),
	statCommon: integer("stat_common").notNull(),
},
(table) => {
	return {
		kanjiIdIdx: index().on(table.kanjiId),
		statCommonIdx: index().on(table.statCommon),
		textIdx: index().on(table.text),
		typeIdx: index().on(table.type),
	}
});

export const kanji = pgTable("kanji", {
	id: serial("id").primaryKey().notNull(),
	text: text("text").notNull(),
	radicalC: integer("radical_c").notNull(),
	radicalN: integer("radical_n").notNull(),
	grade: integer("grade"),
	strokes: integer("strokes").notNull(),
	freq: integer("freq"),
	statCommon: integer("stat_common").notNull(),
	statIrregular: integer("stat_irregular").notNull(),
},
(table) => {
	return {
		freqIdx: index().on(table.freq),
		gradeIdx: index().on(table.grade),
		radicalCIdx: index().on(table.radicalC),
		radicalNIdx: index().on(table.radicalN),
		statCommonIdx: index().on(table.statCommon),
		statIrregularIdx: index().on(table.statIrregular),
		strokesIdx: index().on(table.strokes),
		textIdx: index().on(table.text),
	}
});

export const okurigana = pgTable("okurigana", {
	id: serial("id").primaryKey().notNull(),
	readingId: integer("reading_id").notNull().references(() => reading.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
},
(table) => {
	return {
		readingIdIdx: index().on(table.readingId),
	}
});

export const conjugation = pgTable("conjugation", {
	id: serial("id").primaryKey().notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	from: integer("from").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	via: integer("via"),
},
(table) => {
	return {
		fromIdx: index().on(table.from),
		seqIdx: index().on(table.seq),
	}
});

export const meaning = pgTable("meaning", {
	id: serial("id").primaryKey().notNull(),
	kanjiId: integer("kanji_id").notNull().references(() => kanji.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
},
(table) => {
	return {
		kanjiIdIdx: index().on(table.kanjiId),
		textIdx: index().on(table.text),
	}
});

export const restrictedReadings = pgTable("restricted_readings", {
	id: serial("id").primaryKey().notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	reading: text("reading").notNull(),
	text: text("text").notNull(),
},
(table) => {
	return {
		seqReadingIdx: index().on(table.seq, table.reading),
	}
});

export const conjProp = pgTable("conj_prop", {
	id: serial("id").primaryKey().notNull(),
	conjId: integer("conj_id").notNull().references(() => conjugation.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	conjType: integer("conj_type").notNull(),
	pos: text("pos").notNull(),
	neg: boolean("neg"),
	fml: boolean("fml"),
},
(table) => {
	return {
		conjIdIdx: index().on(table.conjId),
	}
});

export const sense = pgTable("sense", {
	id: serial("id").primaryKey().notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
	ord: integer("ord").notNull(),
},
(table) => {
	return {
		seqIdx: index().on(table.seq),
	}
});

export const senseProp = pgTable("sense_prop", {
	id: serial("id").primaryKey().notNull(),
	tag: text("tag").notNull(),
	senseId: integer("sense_id").notNull().references(() => sense.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	text: text("text").notNull(),
	ord: integer("ord").notNull(),
	seq: integer("seq").notNull().references(() => entry.seq, { onDelete: "cascade", onUpdate: "restrict" } ),
},
(table) => {
	return {
		senseIdTagIdx: index("sense_prop_sense_id_tag_index").on(table.tag, table.senseId),
		seqTagTextIdx: index("sense_prop_seq_tag_text_index").on(table.tag, table.text, table.seq),
		tagTextIdx: index().on(table.tag, table.text),
	}
});