import { type ISyncedLyricsResponse } from "~/types/spotify";
import getSpotifyUserToken from "./getSpotifyUserToken";

const getLyricsBySpotifyId = async (trackId: string) => {
  const token = await getSpotifyUserToken();
  const res = await fetch(
    `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token`,
    {
      headers: {
        method: "GET",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
        "App-platform": "WebPlayer",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    console.error(
      `Error when getting lyrics from Spotify: https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token ${res.status} ${res.statusText}, token ${token}`,
    );
    throw new Error("Error when getting lyrics from Spotify");
  }
  return (await res.json()) as ISyncedLyricsResponse;
};

export default getLyricsBySpotifyId;
