export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AuthorizationResponse extends RefreshTokenResponse {
  refresh_token: string;
}

export interface IPageDetails {
  id?: string;
  uri?: string;
  type?:
    | "playlist"
    | "artist"
    | "collection"
    | "concert"
    | "radio"
    | "episode"
    | "podcast"
    | "top";
  name?: string;
  description?: string | null;
  tracks?: { total?: number };
  snapshot_id?: string;
  owner?: { id?: string; display_name?: string };
  followers?: { total?: number };
  images?: { url?: string }[];
}

export interface ITrackArtist {
  name?: string;
  id?: string;
  uri?: string;
  type?: "artist";
}

export interface ITrack {
  uri?: string;
  preview_url?: string | null;
  id?: string | null;
  name?: string;
  album?: {
    id?: string;
    name?: string;
    images: { url?: string; width?: number | null; height?: number | null }[];
    type?: "track" | "album" | "episode" | "ad";
    uri?: string;
    release_date?: string;
  };
  artists?: ITrackArtist[];
  type?: "track" | "episode" | "ad";
  is_local?: boolean;
  duration_ms?: number;
  position?: number;
  is_playable?: boolean;
  corruptedTrack?: boolean;
  explicit?: boolean;
  added_at?: string | number;
  popularity?: number;
}

export enum DisplayInFullScreen {
  Lyrics = "lyrics",
  Queue = "queue",
  App = "app",
  Player = "player",
}
