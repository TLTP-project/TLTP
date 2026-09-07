import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getCurrentUser } from "@/features/auth";
import { moderatePost, resolveReport } from "@/features/moderation";

export const POST: RequestHandler = async ({ locals, request }) => {
  const currentUser = await getCurrentUser(locals);
  if (!currentUser?.isAdmin) return json({ error: "Không có quyền quản trị." }, { status: 403 });
  const body = await request.json() as { type?: "post" | "report"; post_id?: string; report_id?: string; action?: "hide" | "restore" | "delete"; status?: "pending" | "reviewed" | "actioned" | "dismissed"; note?: string };
  if (body.type === "post" && body.post_id && body.action) {
    const result = await moderatePost({ adminId: currentUser.id, postId: body.post_id, action: body.action, note: body.note });
    return json(result, { status: result.success ? 200 : 400 });
  }
  if (body.type === "report" && body.report_id && body.status) {
    const result = await resolveReport({ adminId: currentUser.id, reportId: body.report_id, status: body.status, moderatorNote: body.note });
    return json(result, { status: result.success ? 200 : 400 });
  }
  return json({ error: "Dữ liệu kiểm duyệt không hợp lệ." }, { status: 400 });
};
