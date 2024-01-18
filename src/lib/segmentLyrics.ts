import { env } from "~/env.mjs";
import type { IchiranResponse } from "~/types/ichiran";

export const segmentLyricLine = async (line: string) => {
  try {
    const res = await fetch(env.ICHIRAN_URL!, {
      body: line,
    });
    if (!res.ok) return [] as IchiranResponse;
    return (await res.json()) as IchiranResponse;
  } catch (error) {
    console.error(error);
    return [];
  }
};
