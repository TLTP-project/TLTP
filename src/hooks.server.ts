import { building } from "$app/environment";
import { svelteKitHandler } from "better-auth/svelte-kit";
import type { Handle } from "@sveltejs/kit";
import { env } from "$lib/config/env";
import { auth } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  if (!env.DEMO_MODE && env.DATABASE_URL) {
    const session = await auth.api.getSession({ headers: event.request.headers });
    if (session) {
      event.locals.session = session.session;
      event.locals.user = session.user;
    }
  }

  return svelteKitHandler({ event, resolve, auth, building });
};
