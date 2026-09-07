import { NextRequest, NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { createAdminClient } from "@/lib/db";
import { softDeletePost } from "@/features/submissions";
import { getCurrentUser } from "@/features/auth";
import { env } from "@/lib/config/env";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!env.NEXT_PUBLIC_DEMO_MODE) {
    const { data: post, error } = await createAdminClient()
      .from("posts_feed_view")
      .select("id, processed_text, display_sender, display_target, target_teacher_id, status, created_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Không thể tải bài viết" }, { status: 500 });
    if (!post) return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });

    return NextResponse.json({
      post: { ...post, updated_at: post.created_at },
    });
  }

  const post = mockDatabase.posts.find((p) => p.id === id && p.status !== "deleted");

  if (!post) {
    return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
  }

  // Sanitize public post output: omit author_id and submission_id to protect anonymity
  const sanitizedPost = { ...post };
  delete sanitizedPost.author_id;
  delete sanitizedPost.submission_id;
  return NextResponse.json({ post: sanitizedPost });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để xóa bài viết." },
      { status: 401 }
    );
  }

  const result = await softDeletePost(user.id, id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Bài viết đã được gỡ bỏ." });
}
