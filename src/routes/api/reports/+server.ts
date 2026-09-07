import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthenticatedUser } from "@/features/auth";
import { submitReport } from "@/features/reports";

export const POST: RequestHandler = async ({ locals, request }) => {
  const user = await getAuthenticatedUser(locals);
  const body = await request.json();
  const result = await submitReport(user?.id ?? null, body);
  return json(result, { status: result.success ? 200 : 400 });
};
