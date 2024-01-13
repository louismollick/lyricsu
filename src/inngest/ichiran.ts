import path from "path";
import childProcess from "child_process";
import { EventSchemas, Inngest } from "inngest";
import { type LyricsWithLines } from "~/types/db";
import { type IchiranResponse } from "~/types/ichiran";
import { drizzleMiddleware } from "./drizzleMiddleware";
import { and, eq } from "drizzle-orm";
import { lines } from "~/server/db/schema";
import { safeJsonParse } from "~/lib/utils";

type LyricsuEventSchemas = {
  [EVENT_LYRICS_SEGMENT]: {
    data: {
      lyrics: LyricsWithLines;
    };
  };
};

export const client = new Inngest({
  id: "lyricsu",
  middleware: [drizzleMiddleware],
  schemas: new EventSchemas().fromRecord<LyricsuEventSchemas>(),
});

export const EVENT_LYRICS_SEGMENT = "lyricsu/lyrics.segment";

export const triggerSegmentLyrics = async (lyrics: LyricsWithLines) =>
  await client.send({
    name: EVENT_LYRICS_SEGMENT,
    data: {
      lyrics,
    },
  });

export const segmentLyrics = client.createFunction(
  { id: "segment-lyrics" },
  { event: EVENT_LYRICS_SEGMENT },
  async ({ event, step, db }) => {
    const segmentedLines = await Promise.all(
      event.data.lyrics.lines.map((line) =>
        step.run(`segment-line: ${line.words}`, () => {
          const cmd = path.join(process.cwd(), "src/inngest/ichiran-cli");
          const output = childProcess.spawnSync(cmd, ["-f", line.words], {
            encoding: "utf8",
          });

          if (output.stderr) console.error("ERROR: " + output.stderr);
          if (output.stdout) console.error("OUTPUT: " + output.stdout);

          return {
            lyricsId: line.lyricsId,
            lineNumber: line.lineNumber,
            segmentation: safeJsonParse<IchiranResponse>(output.stdout, []),
          };
        }),
      ),
    );

    await step.run("save-to-db", async () => {
      console.log(segmentedLines);
      await Promise.all(
        segmentedLines.map(({ lyricsId, lineNumber, segmentation }) =>
          db
            .update(lines)
            .set({ segmentation })
            .where(
              and(
                eq(lines.lyricsId, lyricsId),
                eq(lines.lineNumber, lineNumber),
              ),
            ),
        ),
      );
    });

    return { event, body: event.data.lyrics.id };
  },
);
