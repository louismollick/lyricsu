"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { play, transferPlayback } from "~/lib/spotify";
import { isNumber, isString } from "~/lib/utils";
import { useInterval } from "~/hooks/useInterval";

type PlaybackState = Pick<
  Spotify.PlaybackState,
  "paused" | "position" | "track_window"
> & {
  device_id?: string;
  //active: boolean;
  togglePlay: (uris?: string | string[]) => Promise<void>;
};

const INITIAL_PLAYBACKSTATE: PlaybackState = {
  //   context: {
  //     metadata: null,
  //     uri: null,
  //   },
  //   disallows: {},
  //   duration: 0,
  paused: true,
  position: 0,
  //   loading: true,
  //   timestamp: 0,
  //   repeat_mode: 0,
  //   shuffle: false,
  //   restrictions: {},
  track_window: {
    current_track: {
      album: {
        name: "",
        uri: "",
        images: [],
      },
      artists: [],
      duration_ms: 0,
      id: null,
      is_playable: false,
      name: "",
      uid: "",
      uri: "",
      media_type: "audio",
      type: "track",
      track_type: "audio",
      linked_from: {
        uri: null,
        id: null,
      },
    },
    previous_tracks: [],
    next_tracks: [],
  },
  //   playback_id: "",
  //   playback_quality: "",
  //   playback_features: {
  //     hifi_status: "",
  //   },
  //   device_id: "",
  //   active: false,
  togglePlay: async () => {
    //empty
  },
};

const SpotifyPlayerContext = createContext(INITIAL_PLAYBACKSTATE);

const TICK_INTERVAL = 1000; // ms

function SpotifyPlayerProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [device_id, setDeviceId] = useState<string>();
  const [track_window, setTrackWindow] = useState<Spotify.PlaybackTrackWindow>(
    INITIAL_PLAYBACKSTATE.track_window,
  );
  const spotifyPlayer = useRef<Spotify.Player>();
  const { data: session, status, update } = useSession();

  const { startInterval, stopInterval: stopUpdatingPosition } = useInterval();
  const startUpdatingPosition = useCallback(
    () =>
      startInterval(
        () => setPosition((prev) => prev + TICK_INTERVAL),
        TICK_INTERVAL,
      ),
    [startInterval],
  );

  const initPlayer = useCallback(() => {
    spotifyPlayer.current = new window.Spotify.Player({
      getOAuthToken: (callback: CallableFunction) => {
        void (async () => {
          const spotifyExpiresAt = session?.spotifyExpiresAt;
          const spotifyToken = session?.spotifyToken;

          if (!isNumber(spotifyExpiresAt) || !isString(spotifyToken)) {
            console.error(
              "The session is missing spotifyExpiresAt or spotifyToken.",
            );
            return;
          }

          if (spotifyExpiresAt * 1000 >= Date.now()) {
            callback(spotifyToken);
            return;
          }

          const refreshedSession = await update();
          if (!refreshedSession?.spotifyToken) {
            console.error("Spotify token failed to refresh.");
            return;
          }

          callback(refreshedSession.spotifyToken);
        })();
      },
      name: "Lyricsuuuuuuuu",
    });
    void spotifyPlayer.current.activateElement();

    spotifyPlayer.current.on(
      "ready",
      ({ device_id }: { device_id: string }) => {
        console.log("ready", device_id);
        setDeviceId(device_id);
        void transferPlayback([device_id], {
          play: false,
          accessToken: session?.spotifyToken,
        });
      },
    );
    spotifyPlayer.current.on(
      "not_ready",
      ({ device_id }: { device_id: string }) => {
        console.warn("Device ID has gone offline", device_id);
      },
    );
    spotifyPlayer.current.on("player_state_changed", (playbackState) => {
      if (!playbackState) return;
      setPaused(playbackState.paused);
      setPosition(playbackState.position);
      setTrackWindow(playbackState.track_window);
      playbackState.paused ? stopUpdatingPosition() : startUpdatingPosition();
    });
    spotifyPlayer.current.on("authentication_error", () => {
      console.error("authentication_error");
    });
    spotifyPlayer.current.on("autoplay_failed", () => {
      console.error("autoplay_failed");
    });
    spotifyPlayer.current.addListener("initialization_error", () => {
      console.error("initialization_error");
    });
    spotifyPlayer.current.addListener("account_error", () => {
      console.error("account_error");
    });
    spotifyPlayer.current.addListener("playback_error", () => {
      console.error("playback_error");
    });
    void spotifyPlayer.current.connect().then((success) => {
      console.info(`Spotify Web Playback SDK connect success? ${success}`);
    });
  }, [
    session?.spotifyExpiresAt,
    session?.spotifyToken,
    startUpdatingPosition,
    stopUpdatingPosition,
    update,
  ]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.spotifyToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = initPlayer;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault();
        void spotifyPlayer.current?.togglePlay();
      }
    }

    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      stopUpdatingPosition();
      document.removeEventListener("keydown", handleKeyDown, false);
      if (!spotifyPlayer.current) return;
      spotifyPlayer.current?.removeListener("not_ready");
      spotifyPlayer.current?.removeListener("ready");
      spotifyPlayer.current?.disconnect();
    };
  }, [initPlayer, session?.spotifyToken, status, stopUpdatingPosition]);

  const togglePlay = useCallback(
    async (uris?: string | string[]) => {
      if (!device_id || !session?.spotifyToken) return;
      if (spotifyPlayer.current) await spotifyPlayer.current?.activateElement();
      if (paused) {
        if (uris)
          await play(device_id, {
            accessToken: session.spotifyToken,
            uris,
          });
        await spotifyPlayer.current?.resume();
      } else {
        await spotifyPlayer.current?.pause();
      }
    },
    [device_id, paused, session?.spotifyToken],
  );

  return (
    <SpotifyPlayerContext.Provider
      value={{ paused, position, track_window, togglePlay }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

export { useSpotifyPlayer, SpotifyPlayerProvider };
