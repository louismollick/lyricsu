import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { api } from "~/trpc/server";

const handler = async (
  _: Request,
  { params: { trackId } }: { params: { trackId: string } },
) => {
  try {
    await api.lyrics.resegmentLyricsByTrackId.query(trackId);
    return Response.json("Success!");
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occurred
      const httpCode = getHTTPStatusCodeFromError(cause);
      return Response.json(cause, {
        status: httpCode,
      });
    }
    // Another error occurred
    console.error(cause);
    return Response.json("Internal server error.", {
      status: 500,
    });
  }
};

export { handler as GET, handler as POST };
