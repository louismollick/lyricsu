import ytdl from "ytdl-core";

const getSongUrlFromYoutubeId = async (youtubeId: string) => {
  const startTime = performance.now();
  const ytdlStream = ytdl(youtubeId, { filter: "audioonly" });
  const buffers = [];
  for await (const data of ytdlStream) {
    buffers.push(data);
  }
  const url = `data:audio/mpeg;base64,${Buffer.concat(buffers).toString("base64")}`;
  console.log(`Finished getSongUrlFromYoutubeId in ${performance.now() - startTime} milliseconds.`)
  return url
};

export default getSongUrlFromYoutubeId;
