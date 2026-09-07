import { NextRequest, NextResponse } from "next/server";
import { submitReport, getReports, createReportSchema } from "@/features/reports";
import { getCurrentUser } from "@/features/auth";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";
import type { ReportStatus } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để gửi báo cáo." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!env.NEXT_PUBLIC_DEMO_MODE) {
      const parsed = createReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 422 });
      }

      const supabase = createAdminClient();
      const { data: post, error: postError } = await supabase
        .from("posts_public")
        .select("id")
        .eq("id", parsed.data.post_id)
        .eq("status", "published")
        .maybeSingle();

      if (postError) throw postError;
      if (!post) return NextResponse.json({ error: "Bài viết không tồn tại để báo cáo." }, { status: 404 });

      const { data: report, error } = await supabase
        .from("reports")
        .insert({
          post_id: parsed.data.post_id,
          reporter_id: user.id,
          reason: parsed.data.reason,
          details: parsed.data.details || null,
        })
        .select("id, post_id, reporter_id, reason, details, status, moderator_note, action_taken, created_at, updated_at")
        .single();

      if (error) throw error;
      return NextResponse.json({
        success: true,
        report,
        message: "Cảm ơn bạn đã báo cáo. Ban quản trị sẽ rà soát nội dung này.",
      });
    }

    const result = await submitReport(user.id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      report: result.report,
      message: "Cảm ơn bạn đã báo cáo. Ban quản trị sẽ rà soát nội dung này.",
    });
  } catch (error) {
    console.error("API /api/reports POST error:", error);
    return NextResponse.json({ error: "Lỗi xử lý báo cáo" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "school" || user.verificationStatus !== "active") {
    return NextResponse.json({ error: "Bạn không có quyền xem báo cáo." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ReportStatus | null;

  if (!env.NEXT_PUBLIC_DEMO_MODE) {
    const query = createAdminClient()
      .from("reports")
      .select("id, post_id, reporter_id, reason, details, status, moderator_note, action_taken, created_at, updated_at")
      .order("created_at", { ascending: false });
    const { data, error } = status ? await query.eq("status", status) : await query;
    if (error) return NextResponse.json({ error: "Không thể tải báo cáo." }, { status: 500 });
    return NextResponse.json({ reports: data ?? [] });
  }

  const reports = await getReports(status || undefined);
  return NextResponse.json({ reports });
}
