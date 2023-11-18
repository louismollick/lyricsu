import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { type TokenSet } from "@auth/core/types";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { type Account, accounts, mysqlTable } from "~/server/db/schema";

const SPOTIFY_SCOPES =
  "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify"
    .split(" ")
    .join(",");

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    spotifyToken?: string;
    spotifyExpiresAt?: number;
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

// type RequiredNotNull<T> = {
//   [P in keyof T]: NonNullable<T[P]>;
// };

// type Ensure<T, K extends keyof T> = T & RequiredNotNull<Pick<T, K>>;

type Nullable<T> = { [P in keyof T]: T[P] | null };

export const refreshTokenIfNeeded = async (
  userId: string,
  spotifySession?: Nullable<
    Pick<Account, "access_token" | "refresh_token" | "expires_at">
  >,
) => {
  if (
    spotifySession == null ||
    typeof spotifySession.expires_at !== "number" ||
    typeof spotifySession.refresh_token !== "string"
  ) {
    return null;
  }

  if (spotifySession.expires_at * 1000 >= Date.now())
    return spotifySession.access_token;

  try {
    console.log("Refreshing expired Spotify token...");
    const refreshResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: spotifySession.refresh_token,
        }),
      },
    );

    if (!refreshResponse.ok) throw refreshResponse;

    const refreshedSession = (await refreshResponse.json()) as TokenSet;

    await db
      .update(accounts)
      .set({
        access_token: refreshedSession.access_token,
        expires_at: Math.floor(
          Date.now() / 1000 + (refreshedSession.expires_in ?? 0),
        ),
        refresh_token:
          refreshedSession.refresh_token ?? spotifySession.refresh_token,
      })
      .where(
        and(eq(accounts.userId, userId), eq(accounts.provider, "spotify")),
      );

    return refreshedSession?.access_token;
  } catch (error) {
    console.error("Something went wrong when refreshing a token", error);
    throw error;
  }
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      const [spotifySession] = await db
        .select({
          access_token: accounts.access_token,
          refresh_token: accounts.refresh_token,
          expires_at: accounts.expires_at,
        })
        .from(accounts)
        .where(
          and(eq(accounts.userId, user.id), eq(accounts.provider, "spotify")),
        );

      const spotifyToken = await refreshTokenIfNeeded(user.id, spotifySession);

      return {
        ...session,
        spotifyToken,
        spotifyExpiresAt: spotifySession?.expires_at ?? null,
        user: {
          ...session.user,
          id: user.id,
        },
      } as Session;
    },
  },
  adapter: DrizzleAdapter(db, mysqlTable),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: `https://accounts.spotify.com/authorize?scope=${SPOTIFY_SCOPES}`,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
