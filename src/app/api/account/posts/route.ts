import { NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { getCurrentUser } from "@/features/auth";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để xem bài viết của bạn." },
      { status: 401 }
    );
  }

  if (!env.NEXT_PUBLIC_DEMO_MODE) {
    const { data, error } = await createAdminClient()
      .from("posts_public")
      .select("id, submission_id, author_id, processed_text, display_sender, display_target, target_teacher_id, status, created_at, updated_at, deleted_at")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Không thể tải bài viết của bạn." }, { status: 500 });
    return NextResponse.json({ posts: data ?? [] });
  }

  // Return user's posts (including deleted/hidden so they can track status)
  const posts = mockDatabase.posts.filter((p) => p.author_id === user.id);

  return NextResponse.json({ posts });
}
