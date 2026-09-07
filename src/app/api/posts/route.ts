import { NextRequest, NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";
import { getCurrentUser } from "@/features/auth";

export async function GET(request: NextRequest) {
  const scope = new URL(request.url).searchParams.get("scope");

  if (scope === "moderation") {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Bạn không có quyền xem nội dung kiểm duyệt." }, { status: 403 });
    }

    if (env.NEXT_PUBLIC_DEMO_MODE) {
      return NextResponse.json({ posts: mockDatabase.posts });
    }

    const { data, error } = await createAdminClient()
      .from("posts_public")
      .select("id, submission_id, author_id, processed_text, display_sender, display_target, target_teacher_id, status, created_at, updated_at, deleted_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Không thể tải nội dung kiểm duyệt." }, { status: 500 });
    return NextResponse.json({ posts: data ?? [] });
  }

  if (env.NEXT_PUBLIC_DEMO_MODE) {
    return NextResponse.json({
      posts: mockDatabase.posts.filter((post) => post.status === "published"),
    });
  }

  const { data, error } = await createAdminClient()
    .from("posts_feed_view")
    .select("id, processed_text, display_sender, display_target, target_teacher_id, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Không thể tải bảng tin." }, { status: 500 });

  return NextResponse.json({
    posts: (data ?? []).map((post) => ({ ...post, updated_at: post.created_at })),
  });
}
