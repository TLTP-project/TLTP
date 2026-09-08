import type { PageServerLoad } from "./$types";
import { listPublishedPosts } from "$lib/server/repository";

export const load: PageServerLoad = async () => ({
  posts: await listPublishedPosts(100),
});
