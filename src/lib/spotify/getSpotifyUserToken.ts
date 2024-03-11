import { env } from "~/env.js";

const getSpotifyUserToken = async () => {
  const res = await fetch(
    "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
    {
      headers: {
        method: "GET",
        referer: "https://open.spotify.com/",
        origin: "https://open.spotify.com",
        accept: "application/json",
        "accept-language": "en",
        "app-platform": "WebPlayer",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
        "content-type": "text/html; charset=utf-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "spotify-app-version": "1.1.54.35.ge9dace1d",
        cookie: `sp_dc=${env.SPOTIFY_SP_DC}`,
      },
    },
  );
  if (!res.ok) {
    console.error(
      `Error getting Spotify user token: https://open.spotify.com/get_access_token null token with status: ${res.status} and cookie: ${
        process.env.SPOTIFY_ACCESS_COOKIE ?? "no cookie"
      }`,
    );
    throw new Error("Error getting Spotify user token.");
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
};

export default getSpotifyUserToken;
