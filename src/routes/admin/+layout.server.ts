import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getCurrentUser } from "@/features/auth";

export const load: LayoutServerLoad = async ({ locals }) => {
  const currentUser = await getCurrentUser(locals);
  if (!currentUser) throw redirect(303, "/login");
  if (!currentUser.isAdmin) throw error(403, "Bạn không có quyền quản trị.");
  return { currentUser };
};
