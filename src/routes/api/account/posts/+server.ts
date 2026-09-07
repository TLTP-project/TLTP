import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "@/features/auth";
import { softDeletePost } from "@/features/submissions";
import { listPostsByAuthor } from "$lib/server/repository";

export const GET: RequestHandler = async ({ locals }) => {
  const user = await getAuthenticatedUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập để xem bài của mình." }, { status: 401 });
  return json({ posts: await listPostsByAuthor(user.id) });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  const user = await getAuthenticatedUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const body = await request.json() as { post_id?: string };
  if (!body.post_id) return json({ error: "Thiếu mã bài viết." }, { status: 400 });
  const result = await softDeletePost(user.id, body.post_id);
  return json(result, { status: result.success ? 200 : 400 });
};
