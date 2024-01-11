import { defer } from "@defer/client";
import childProcess from "child_process";
import path from "path";

async function createWordSegmentation() {
  return new Promise((resolve) => {
    try {
      const cmd = path.join(process.cwd(), "src/defer/ichiran-cli");
      const output = childProcess.spawnSync(cmd, ["--help"], {
        encoding: "utf8",
      });
      console.log("DEFER OUTPUT: " + output.stdout);
      console.log("DEFER ERROR: " + JSON.stringify(output.error));
    } catch (error) {
      console.log("DEFER THROWS: " + JSON.stringify(error));
    }
    resolve("done");
  });
}

export default defer(createWordSegmentation);
