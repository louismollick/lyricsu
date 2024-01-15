import path from "path";
import childProcess from "child_process";
import { type LyricsWithLines } from "~/types/db";
import { type IchiranResponse } from "~/types/ichiran";
import { and, eq } from "drizzle-orm";
import { lines } from "~/server/db/schema";
import { safeJsonParse } from "~/lib/utils";
import { db } from "~/server/db";

export const triggerSegmentLyrics = async (lyrics: LyricsWithLines) =>
  await Promise.all(
    lyrics.lines.map((line) => {
      const cmd = path.join(process.cwd(), "src/lib/ichiran-cli");
      const output = childProcess.spawnSync(cmd, ["-f", line.words], {
        encoding: "utf8",
      });

      if (output.error) console.error("ERROR: " + JSON.stringify(output.error));

      return db
        .update(lines)
        .set({
          segmentation: safeJsonParse<IchiranResponse>(output.stdout, []),
        })
        .where(
          and(
            eq(lines.lyricsId, line.lyricsId),
            eq(lines.lineNumber, line.lineNumber),
          ),
        );
    }),
  );
