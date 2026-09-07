import { NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { getCurrentDevUser } from "@/features/auth";

export async function GET() {
  const user = getCurrentDevUser();

  // Return user's posts (including deleted/hidden so they can track status)
  const posts = mockDatabase.posts.filter((p) => p.author_id === user.id);

  return NextResponse.json({ posts });
}
