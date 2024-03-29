import { segmentLyricLine } from "../segmentation/segmentLyricLine";
import getLyricsBySpotifyId from "./getLyricsBySpotifyId";

const getSegmentedLyricsFromSpotifyId = async (spotifyTrackId: string) => {
  const lyricsFromAPI = await getLyricsBySpotifyId(spotifyTrackId);

  const startTime = performance.now();
  const segmentedLyrics = {
    ...lyricsFromAPI.lyrics,
    lines: await Promise.all(
      lyricsFromAPI.lyrics.lines.map(async (line) => ({
        ...line,
        segmentation: await segmentLyricLine(line.words),
      })),
    ),
  };
  console.log(`Finished all segmentLyricLine(s) in ${performance.now() - startTime} milliseconds.`)

  return segmentedLyrics;
};

export default getSegmentedLyricsFromSpotifyId;
