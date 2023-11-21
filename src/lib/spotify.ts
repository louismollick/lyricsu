import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";

interface ICallSpotifyApi {
  endpoint: string;
  method: string;
  accessToken?: string | null;
  cookies?: string;
  body?: BodyInit | null;
  retry?: boolean;
}

export interface ISyncedLyricsResponse {
  lyrics: {
    syncType: "LINE_SYNCED" | "UNSYNCED";
    lines: {
      startTimeMs: string;
      words: string;
      syllables: [];
      endTimeMs: string;
    }[];
    provider: string;
    providerLyricsId: string;
    providerDisplayName: string;
    syncLyricsUri: string;
    isDenseTypeface: boolean;
    alternatives: [];
    language: string;
    isRtlLanguage: boolean;
    fullscreenAction: string;
  };
  colors: {
    background: number;
    text: number;
    highlightText: number;
  };
  hasVocalRemoval: boolean;
}

export async function callSpotifyApi({
  endpoint,
  method,
  accessToken,
  body,
}: ICallSpotifyApi): Promise<Response> {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
  if (!res.ok) throw Error("Error when calling spotifyApi: " + res.statusText);
  return res;
}

export async function play(
  deviceId: string,
  options: {
    accessToken: string;
    context_uri?: string;
    uris?: string | string[];
    offset?: number;
  },
) {
  const { accessToken, context_uri, offset, uris } = options;
  const body: {
    context_uri?: string;
    uris?: string[];
    offset?: { position: number };
    position_ms: number;
  } = { position_ms: 0 };

  if (offset !== undefined) {
    body.offset = { position: offset };
  }

  if (context_uri) {
    body.context_uri = context_uri;
  } else if (Array.isArray(uris) && uris.length) {
    body.uris = [...new Set(uris)];
  } else if (uris && typeof uris === "string") {
    body.uris = [uris];
  }

  await callSpotifyApi({
    endpoint: `/me/player/play?device_id=${deviceId}`,
    method: "PUT",
    accessToken,
    body: JSON.stringify(body),
  });

  return;
}

export async function transferPlayback(
  device_ids: string[],
  options: { play?: boolean; accessToken?: string } | undefined,
) {
  const { accessToken, play = true } = options ?? {};
  if (!accessToken) return;

  const res = await callSpotifyApi({
    endpoint: "/me/player",
    method: "PUT",
    accessToken,
    body: JSON.stringify({
      device_ids,
      play,
    }),
  });

  return res.ok;
}

export async function getToken(): Promise<string | null> {
  console.log(`Cookie: ${env.SPOTIFY_SP_DC}`);
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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: `Warning: https://open.spotify.com/get_access_token null token with status: ${
        res.status
      } and cookie: ${process.env.SPOTIFY_ACCESS_COOKIE ?? "no cookie"}`,
    });
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

export async function getLyricsBySpotifyTrackId(trackId: string) {
  const token = await getToken();
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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token ${res.status} ${res.statusText}, token ${token}`,
    });
  }
  return (await res.json()) as ISyncedLyricsResponse;
}
