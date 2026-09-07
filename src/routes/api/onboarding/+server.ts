import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser, onboardUserRole } from "@/features/auth";

export const POST: RequestHandler = async ({ locals, request }) => {
  const user = await getAuthenticatedUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const body = await request.json() as { role?: "student" | "teacher" | "school" };
  if (!body.role) return json({ error: "Vui lòng chọn vai trò." }, { status: 400 });
  const result = await onboardUserRole(user.id, body.role, user.email ?? undefined);
  return json(result, { status: result.success ? 200 : 400 });
};
