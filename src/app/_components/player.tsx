"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import SpotifyPlayer, { type Props } from "react-spotify-web-playback";

export default function Player({
  accessToken,
  trackUri,
}: {
  accessToken: string;
  trackUri?: string;
}) {
//   const session = useSession();

  const [play, setPlay] = useState(false);

  //   const getOAuthToken: Props["getOAuthToken"] = async (callback) => {
  //     if (session.data?.expires && parseInt(session.data.expires) > Date.now()) {
  //       callback(accessToken);

  //       return;
  //     }

  //     callback(access_token);
  //   };

  useEffect(() => setPlay(true), [trackUri]);

  if (!accessToken) return null;
  return (
    <SpotifyPlayer
      //   getOAuthToken={getOAuthToken}
      token={accessToken}
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
