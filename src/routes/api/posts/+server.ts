import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { listPublishedPosts } from "$lib/server/repository";

export const GET: RequestHandler = async ({ url }) => {
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  return json({ posts: await listPublishedPosts(limit) });
};
