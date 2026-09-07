import type { PageServerLoad } from "./$types";
import { env } from "$lib/config/env";

export const load: PageServerLoad = () => ({
  turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY,
});
