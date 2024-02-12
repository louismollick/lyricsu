import ytdl from "ytdl-core";

const getSongUrlFromYoutubeId = async (youtubeId: string) => {
  const ytdlStream = ytdl(youtubeId, { filter: "audioonly" });
  const buffers = [];
  for await (const data of ytdlStream) {
    buffers.push(data);
  }
  return `data:audio/mpeg;base64,${Buffer.concat(buffers).toString("base64")}`;
};

export default getSongUrlFromYoutubeId;
