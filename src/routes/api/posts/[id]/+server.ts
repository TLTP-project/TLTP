import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getPostById } from "$lib/server/repository";

export const GET: RequestHandler = async ({ params }) => {
  const post = await getPostById(params.id);
  if (!post) return json({ error: "Bài viết không tồn tại" }, { status: 404 });
  if (post.status === "deleted") {
    return json({ post: { ...post, processed_text: "" } });
  }
  return json({ post });
};
