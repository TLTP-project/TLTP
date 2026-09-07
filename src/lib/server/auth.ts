import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$lib/config/env";
import { db } from "$lib/server/db";
import { account, session, user, verification } from "$lib/server/db/schema";

const socialProviders = {
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } }
    : {}),
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {}),
};

export const auth = betterAuth({
  appName: "Trải Lòng Trần Phú",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, account, session, verification },
  }),
  socialProviders,
  plugins: [sveltekitCookies(getRequestEvent)],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.BETTER_AUTH_URL.startsWith("https://"),
    },
  },
});

export type Auth = typeof auth;
