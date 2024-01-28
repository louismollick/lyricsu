import React from "react";
import PlayerControls from "./playerControls";
import ytdl from "ytdl-core";

const YtMusicPlayer = async ({ youtubeId }: { youtubeId: string }) => {
  const buffers = [];
  const ytdlStream = ytdl(youtubeId, { filter: "audioonly" });
  for await (const data of ytdlStream) {
    buffers.push(data);
  }
  const songUrl = `data:audio/mpeg;base64,${Buffer.concat(buffers).toString("base64")}`;

  return <PlayerControls songUrl={songUrl} />;
};

export default YtMusicPlayer;
