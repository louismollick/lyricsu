import { InngestMiddleware } from "inngest";
import { connectDrizzle } from "~/server/db";

export const drizzleMiddleware = new InngestMiddleware({
  name: "Drizzle Middleware",
  init: () => {
    const db = connectDrizzle();
    return {
      onFunctionRun: () => ({
        transformInput: () => ({
          ctx: {
            db,
          },
        }),
      }),
    };
  },
});
