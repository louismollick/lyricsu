import { env } from "~/env.js";
import type { IchiranResponse } from "~/types/ichiran";

export const segmentLyricLine = async (line: string) => {
  if (!line) return [];
  try {
    const res = await fetch(env.ICHIRAN_URL!, {
      method: "POST",
      body: line,
    });
    if (!res.ok) {
      const reason = await res.text();
      console.error(reason);
      return []
    }
    return (await res.json()) as IchiranResponse;
  } catch (error) {
    console.error('Error returned from Ichiran:', error);
    return [];
  }
};
