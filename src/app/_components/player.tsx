"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SpotifyPlayer, { type Props } from "react-spotify-web-playback";

export default function Player({ trackUri }: { trackUri?: string }) {
  const { data: session, status, update } = useSession();

  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [trackUri]);

  const getOAuthToken: Props["getOAuthToken"] = async (callback) => {
    console.log("getOAuthToken");
    if (
      typeof session?.spotifyExpiresAt !== "number" ||
      typeof session?.spotifyToken !== "string"
    ) {
      console.error("The session is missing spotifyExpiresAt or spotifyToken.");
      return;
    }

    if (session.spotifyExpiresAt * 1000 >= Date.now())
      return callback(session.spotifyToken);

    const refreshedSession = await update();
    if (!refreshedSession?.spotifyToken) {
      console.error("Spotify token failed to refresh.");
      return;
    }

    return callback(refreshedSession.spotifyToken);
  };

  if (
    status === "loading" ||
    status === "unauthenticated" ||
    !session?.spotifyToken
  )
    return null;

  return (
    <SpotifyPlayer
      getOAuthToken={getOAuthToken}
      token={session.spotifyToken}
      showSaveIcon
      inlineVolume={false}
      callback={(state) => {
        if (!state.isPlaying) setPlay(false);
      }}
      play={play}
      uris={trackUri ? [trackUri] : []}
    />
  );
}
