import { env } from "~/env.mjs";
import type { IchiranResponse } from "~/types/ichiran";

export const segmentLyricLine = async (line: string) => {
  try {
    const res = await fetch(env.ICHIRAN_URL!, {
      method: "POST",
      body: line,
    });
    if (!res.ok) {
      const reason = await res.text();
      console.error(reason);
      return [] as IchiranResponse;
    }
    return (await res.json()) as IchiranResponse;
  } catch (error) {
    console.error(error);
    return [];
  }
};
