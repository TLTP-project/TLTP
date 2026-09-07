import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getPostById } from "$lib/server/repository";

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostById(params.id);
  if (!post) throw error(404, "Bài viết không tồn tại");
  return { post };
};
