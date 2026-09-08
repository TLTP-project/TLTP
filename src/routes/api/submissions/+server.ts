import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getCurrentUser } from "@/features/auth";
import { submitFeedback } from "@/features/submissions";
import type { CreateSubmissionInput } from "@/types";

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
  const user = await getCurrentUser(locals);
  if (!user) return json({ error: "Bạn cần đăng nhập để gửi phản hồi." }, { status: 401 });
  const body = await request.json() as Partial<CreateSubmissionInput>;
  const input: CreateSubmissionInput = {
    ...body,
    // Never trust a role sent by the browser. The saved account profile is authoritative.
    role: user.role,
    text: typeof body.text === "string" ? body.text : "",
  };
  const result = await submitFeedback(user.id, input, getClientAddress(), request.headers.get("user-agent") ?? undefined, user.isAdmin);
  return json(result, { status: result.success ? 200 : 400 });
};
