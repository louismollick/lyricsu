import { defer } from "@defer/client";
import childProcess from "child_process";

async function createWordSegmentation() {
  return new Promise((resolve) => {
    const output = childProcess.spawnSync("./ichiran-cli", ["--help"], {
      encoding: "utf8",
    });
    console.log("DEFER OUTPUT: " + output.stdout);
    console.log("DEFER ERROR: " + JSON.stringify(output.error));
    resolve("done");
  });
}

export default defer(createWordSegmentation);
