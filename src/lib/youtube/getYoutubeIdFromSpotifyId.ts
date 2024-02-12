import { env } from "~/env.mjs";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { type MusicVideo, searchMusics } from "node-youtube-music";

const spotifyApi = SpotifyApi.withClientCredentials(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
);

const getYoutubeTrackFromSpotifyId = async (spotifyTrackId: string) => {
  const spotifyTrack = await spotifyApi.tracks.get(spotifyTrackId);

  const artist = spotifyTrack.artists.map((artist) => artist.name).join(" ");

  const youtubeSearchResults = await searchMusics(
    `${artist} ${spotifyTrack.name}`,
  );

  const youtubeTrack = youtubeSearchResults.find((vid) => vid.youtubeId);

  if (!youtubeTrack?.youtubeId) {
    const error = `Could not find Youtube results for search: ${spotifyTrack.artists[0]?.name} ${spotifyTrack.name}`;
    console.error(error);
    throw new Error(error);
  }

  return youtubeTrack as MusicVideo & { youtubeId: string };
};

export default getYoutubeTrackFromSpotifyId;
