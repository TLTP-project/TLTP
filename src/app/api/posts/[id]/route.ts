import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDatabase } from "@/lib/db";
import { createAdminClient } from "@/lib/db";
import { softDeletePost } from "@/features/submissions";
import { getCurrentUser } from "@/features/auth";
import { env } from "@/lib/config/env";

const moderationActionSchema = z.object({
  action: z.enum(["hide", "delete", "restore"]),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "school" || user.verificationStatus !== "active") {
    return NextResponse.json({ error: "Bạn không có quyền kiểm duyệt bài viết." }, { status: 403 });
  }

  const parsed = moderationActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Thao tác kiểm duyệt không hợp lệ." }, { status: 422 });
  }

  if (env.NEXT_PUBLIC_DEMO_MODE) {
    const result = await import("@/features/moderation").then(({ moderatePost }) =>
      moderatePost({ adminId: user.id, postId: id, action: parsed.data.action })
    );
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = createAdminClient();
    const { data: post, error: lookupError } = await supabase
      .from("posts_public")
      .select("id, submission_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!post) return NextResponse.json({ error: "Bài viết không tồn tại." }, { status: 404 });

    const status = parsed.data.action === "hide"
      ? "hidden"
      : parsed.data.action === "delete"
      ? "deleted"
      : "published";
    const { error: updateError } = await supabase
      .from("posts_public")
      .update({
        status,
        deleted_at: parsed.data.action === "delete" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    await supabase.from("moderation_audit").insert({
      post_id: id,
      submission_id: post.submission_id,
      prompt_version: "moderator-v1",
      model: "moderator",
      decision: parsed.data.action,
      flags: {},
      token_usage: {},
    });
    await supabase.from("admin_access_audit").insert({
      admin_id: user.id,
      resource_type: "post",
      resource_id: id,
      action: parsed.data.action,
      reason: "Manual moderation action",
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("API /api/posts/[id] PATCH error:", error);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái bài viết." }, { status: 500 });
  }
}
