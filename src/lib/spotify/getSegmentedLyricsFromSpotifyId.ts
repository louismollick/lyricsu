import { segmentLyricLine } from "../segmentation/segmentLyricLine";
import getLyricsBySpotifyId from "./getLyricsBySpotifyId";

const getSegmentedLyricsFromSpotifyId = async (spotifyTrackId: string) => {
  const lyricsFromAPI = await getLyricsBySpotifyId(spotifyTrackId);

  const segmentedLyrics = {
    ...lyricsFromAPI.lyrics,
    lines: await Promise.all(
      lyricsFromAPI.lyrics.lines.map(async (line) => ({
        ...line,
        segmentation: await segmentLyricLine(line.words),
      })),
    ),
  };

  return segmentedLyrics;
};

export default getSegmentedLyricsFromSpotifyId;
