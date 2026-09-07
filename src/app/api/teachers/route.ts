import { NextResponse } from "next/server";
import { mockDatabase } from "@/lib/db";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";

export async function GET() {
  if (env.NEXT_PUBLIC_DEMO_MODE) {
    return NextResponse.json({ teachers: mockDatabase.teachers });
  }

  const { data, error } = await createAdminClient()
    .from("teachers")
    .select("id, display_name, subject, active, created_at")
    .eq("active", true)
    .order("display_name");

  if (error) return NextResponse.json({ error: "Không thể tải danh sách giáo viên." }, { status: 500 });
  return NextResponse.json({ teachers: data ?? [] });
}
