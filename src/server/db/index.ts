import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "~/env.mjs";
import * as schema from "./schema";

export const connectDrizzle = () =>
  drizzle(
    new Client({
      url: env.DATABASE_URL,
    }).connection(),
    { schema },
  );

export const db = connectDrizzle();
