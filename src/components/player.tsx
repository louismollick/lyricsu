"use client";
import { useSpotifyPlayer } from "~/context/spotifyPlayerContext";
import { Button } from "./ui/button";

export default function Player({ trackUri }: { trackUri?: string }) {
  const { togglePlay, paused } = useSpotifyPlayer();
  return (
    <Button className="mt-auto" onClick={() => togglePlay(trackUri)}>
      {paused ? "Play" : "Pause"}
    </Button>
  );
}
