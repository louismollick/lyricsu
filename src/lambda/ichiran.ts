import path from "path";
import childProcess from "child_process";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// eslint-disable-next-line @typescript-eslint/require-await
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    console.error("Event body is empty, sending failure");
    return {
      statusCode: 400,
      body: "Error: event.body is empty.",
    };
  }

  const cmd = path.join(process.cwd(), "ichiran-cli");
  const result = childProcess.spawnSync(cmd, ["-f", event.body], {
    encoding: "utf8",
  });

  if (result.error) {
    console.error(result.error);
    return {
      statusCode: 400,
      body: JSON.stringify(result.error),
    };
  }

  return {
    statusCode: 200,
    body: result.stdout,
  };
}
