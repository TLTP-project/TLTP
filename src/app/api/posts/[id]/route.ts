import { NextRequest, NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { softDeletePost } from "@/features/submissions";
import { getCurrentDevUser } from "@/features/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  const user = getCurrentDevUser();

  const result = await softDeletePost(user.id, id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Bài viết đã được gỡ bỏ." });
}
