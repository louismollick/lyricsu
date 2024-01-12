import { type lyrics, type lines } from "~/server/db/schema";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};
