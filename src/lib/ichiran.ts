import { type lyrics, type lines } from "~/server/db/schema";
import { type IchiranResponse } from "~/types/ichiran";
import childProcess from "child_process";
import path from "path";

export type LyricsWithLines = typeof lyrics.$inferSelect & {
  lines: (typeof lines.$inferSelect)[];
};

export const getSentenceSegmentation = (sentence: string) => {
  const cmd = path.join(process.cwd(), "src/lib/ichiran-cli");
  const output = childProcess.spawnSync(cmd, ["-f", sentence], {
    encoding: "utf8",
  });

  if (output.error) {
    console.log("NORMAL ERROR: " + JSON.stringify(output.error));
    return [];
  }
  console.log("NORMAL OUTPUT: " + JSON.stringify(output.stdout));
  return JSON.parse(output.stdout) as IchiranResponse;
};

export const getLyricsPlusSegmentation = async (lyrics: LyricsWithLines) => ({
  ...lyrics,
  lines: await Promise.all(
    lyrics.lines.map((line) => ({
      ...line,
      segmentation: getSentenceSegmentation(line.words),
    })),
  ),
});
