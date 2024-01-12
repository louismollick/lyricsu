import path from "path";
import { inngest } from "./client";
import childProcess from "child_process";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  // eslint-disable-next-line @typescript-eslint/require-await
  async ({ event }) => {
    const cmd = path.join(process.cwd(), "src/inngest/ichiran-cli");
    const output = childProcess.spawnSync(cmd, ["--help"], {
      encoding: "utf8",
    });
    return { event, body: `INNGEST OUTPUT: ${JSON.stringify(output)}` };
  },
);
