import path from "path";
import childProcess from "child_process";
import { EventSchemas, Inngest } from "inngest";
import { type LyricsWithLines } from "~/types/db";
import { type IchiranResponse } from "~/types/ichiran";

type LyricsuEventSchemas = {
  [EVENT_LYRICS_SEGMENT]: {
    data: {
      lyrics: LyricsWithLines;
    };
  };
};

export const client = new Inngest({
  id: "lyricsu",
  schemas: new EventSchemas().fromRecord<LyricsuEventSchemas>(),
});

export const EVENT_LYRICS_SEGMENT = "lyricsu/lyrics.segment";

export const triggerSegmentLyrics = async (lyrics: LyricsWithLines) => {
  const sentEvent = await client.send({
    name: EVENT_LYRICS_SEGMENT,
    data: {
      lyrics,
    },
  });

  console.log(`SENT IDS: ${JSON.stringify(sentEvent.ids)}}`);

  // TODO: replace with sending back ids to client 
  return {
    ...lyrics,
    lines: lyrics.lines.map((line) => ({
      ...line,
      segmentation: [] as IchiranResponse,
    })),
  };
};

export const segmentLyrics = client.createFunction(
  { id: "segment-lyrics" },
  { event: EVENT_LYRICS_SEGMENT },
  async ({ event, step }) => {
    const lines = await Promise.all(
      event.data.lyrics.lines.map((line) =>
        step.run(`segment-line: ${line.words}`, () => {
          const cmd = path.join(process.cwd(), "src/inngest/ichiran-cli");
          const output = childProcess.spawnSync(cmd, ["--help"], {
            encoding: "utf8",
          });
          return output.stdout;
        }),
      ),
    );

    return { event, body: lines };
  },
);
