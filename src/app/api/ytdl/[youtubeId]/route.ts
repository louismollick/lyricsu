import { NextResponse } from "next/server";
import * as ytdl from "ytdl-core";

export function GET(
  _: Request,
  { params: { youtubeId } }: { params: { youtubeId: string } },
) {
  return ytdl
    .getInfo(youtubeId)
    .then((info) => {
      if (info.player_response.playabilityStatus.status !== "OK") {
        return NextResponse.json(
          {
            message: "Video is not available",
          },
          {
            status: 400,
          },
        );
      }

      const title = info.videoDetails.title
        .replace(" (Official Music Video)", "")
        .replace(" [Official Music Video]", "")
        .replace("", "");

      const author = info.videoDetails.author.name
        .replace(" - Topic", "")
        .replace("VEVO", "");

      const stream = ytdl.downloadFromInfo(info, {
        filter: "audioonly",
      });

      return new Promise<Buffer>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _buf = Array<any>();
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) =>
          reject(`error converting stream - ${JSON.stringify(err)}`),
        );
      })
        .then((buffer) => {
          const headers = {
            "Content-Type": "audio/mpeg",
            "Content-Length": buffer.length.toString(),
            Title: encodeURI(title),
            Author: encodeURI(author),
            Thumbnail: encodeURI(info.videoDetails.thumbnails[0]?.url ?? ""),
          };

          return new Response(buffer, { headers });
        })
        .catch((e) => {
          console.error(e);
          return NextResponse.json(
            {
              message: "Error when converting stream",
            },
            { status: 500 },
          );
        });
    })
    .catch((e) => {
      console.error(e);
      return NextResponse.json(
        {
          message: "Error when fetching video info",
        },
        { status: 500 },
      );
    });
}
