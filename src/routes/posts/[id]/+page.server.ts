import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getPostById, listCommentsByPost } from "$lib/server/repository";
import { getAuthenticatedUser } from "@/features/auth";
import { env } from "$lib/config/env";

export const load: PageServerLoad = async ({ params, locals }) => {
  const post = await getPostById(params.id);
  if (!post) throw error(404, "Bài viết không tồn tại");
  return {
    post,
    comments: post.status === "published" ? await listCommentsByPost(params.id) : [],
    turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY,
    isAuthenticated: Boolean(await getAuthenticatedUser(locals)),
  };
};
