import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

type SocialProviders = NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;

/** Social sign-in is enabled per provider when its credentials are configured. */
function socialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  const env = process.env;
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET };
  }
  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
    providers.discord = { clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET };
  }
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  }
  return providers;
}

export const enabledSocialProviders = Object.keys(socialProviders()) as ("github" | "discord" | "google")[];

export const auth = betterAuth({
  appName: "animenew",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: socialProviders(),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
      bio: { type: "string", required: false, input: true },
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 24,
    }),
    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

/** Current session for server components and actions, memoised per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
