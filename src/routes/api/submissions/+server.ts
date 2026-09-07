import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "@/features/auth";
import { submitFeedback } from "@/features/submissions";

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
  const user = await getAuthenticatedUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập để gửi phản hồi." }, { status: 401 });
  const input = await request.json();
  const result = await submitFeedback(user.id, input, getClientAddress(), request.headers.get("user-agent") ?? undefined);
  return json(result, { status: result.success ? 200 : 400 });
};
