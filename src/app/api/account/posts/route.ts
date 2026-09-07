import { NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { getCurrentUser } from "@/features/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để xem bài viết của bạn." },
      { status: 401 }
    );
  }

  // Return user's posts (including deleted/hidden so they can track status)
  const posts = mockDatabase.posts.filter((p) => p.author_id === user.id);

  return NextResponse.json({ posts });
}
