import { serve } from "inngest/next";
import { client, segmentLyrics } from "~/inngest/ichiran";

export const { GET, POST, PUT } = serve({
  client,
  functions: [segmentLyrics],
});
