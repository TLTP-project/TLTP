import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getPostById } from "$lib/server/repository";

export const GET: RequestHandler = async ({ params }) => {
  const post = await getPostById(params.id);
  return post ? json({ post }) : json({ error: "Bài viết không tồn tại" }, { status: 404 });
};
