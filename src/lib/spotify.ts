"use client";
interface ICallSpotifyApi {
  endpoint: string;
  method: string;
  accessToken?: string | null;
  cookies?: string;
  body?: BodyInit | null;
  retry?: boolean;
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
