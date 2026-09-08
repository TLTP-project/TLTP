import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getCurrentUser } from "@/features/auth";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || typeof locals.user.id !== "string") throw redirect(303, "/login");
  const currentUser = await getCurrentUser(locals);
  if (!currentUser) throw redirect(303, "/login");

  return {
    user: {
      name: typeof locals.user.name === "string" ? locals.user.name : null,
      email: typeof locals.user.email === "string" ? locals.user.email : null,
      image: typeof locals.user.image === "string" ? locals.user.image : null,
    },
    role: currentUser.role,
    verificationStatus: currentUser.verificationStatus,
  };
};
