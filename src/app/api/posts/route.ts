import { NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";

export async function GET() {
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
