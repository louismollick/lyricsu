export const getSongLength = (bufferDuration: number, playbackRate: number) => {
  return bufferDuration / playbackRate;
};

export function isYoutubeURL(url: string) {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

export function getYouTubeId(url: string) {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.exec(url)?.[5];
}

export function isJSONString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function getFormattedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

export interface Song {
  fileUrl: string;
  metadata: {
    id: string | null;
    title: string;
    author: string;
    coverUrl: string;
  };
}

export async function getSongFromYouTube(id?: string) {
  if (!id) return null;

  const res = await fetch(`/api/ytdl/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = (await res.json()) as { message: string };
    if (body.message) {
      throw new Error(body.message);
    }
    throw new Error(`Error downloading YouTube music (${res.statusText})`);
  }

  const blob = await res.blob();
  const metadata = {
    id,
    title: decodeURI(res.headers.get("Title")!),
    author: decodeURI(res.headers.get("Author")!),
    coverUrl: decodeURI(res.headers.get("Thumbnail")!),
  };

  const fileUrl = URL.createObjectURL(blob);
  return { fileUrl, metadata } as Song;
}
