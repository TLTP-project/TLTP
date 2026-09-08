import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getCurrentUser } from "@/features/auth";
import { createComment } from "@/features/comments";
import { listCommentsByPost } from "$lib/server/repository";

export const GET: RequestHandler = async ({ params }) => {
  return json({ comments: await listCommentsByPost(params.id) });
};

export const POST: RequestHandler = async ({ locals, params, request, getClientAddress }) => {
  const user = await getCurrentUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập để bình luận." }, { status: 401 });
  const body = await request.json();
  const result = await createComment(params.id, user.id, user.role, body, getClientAddress(), user.isAdmin);
  return json(result, { status: result.success ? 200 : 400 });
};
