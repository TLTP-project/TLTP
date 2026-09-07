import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAuthenticatedUser } from "@/features/auth";
import { listPostsByAuthor } from "$lib/server/repository";

export const load: PageServerLoad = async ({ locals }) => {
  const user = await getAuthenticatedUser(locals);
  if (!user) throw redirect(303, "/login");
  return { posts: await listPostsByAuthor(user.id) };
};
