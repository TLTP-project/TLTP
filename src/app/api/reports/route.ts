import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitReport, getReports, createReportSchema } from "@/features/reports";
import { getCurrentUser } from "@/features/auth";
import { createAdminClient } from "@/lib/db";
import { env } from "@/lib/config/env";
import type { ReportStatus } from "@/types";

const moderationReportSchema = z.object({
  report_id: z.string().uuid(),
  action: z.enum(["hide", "delete", "dismiss"]),
  moderator_note: z.string().max(1000).optional(),
});

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
  if (!user?.isAdmin) {
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

    const postIds = (data ?? []).map((report) => report.post_id);
    const { data: posts, error: postsError } = postIds.length
      ? await createAdminClient()
          .from("posts_public")
          .select("id, submission_id, author_id, processed_text, display_sender, display_target, target_teacher_id, status, created_at, updated_at, deleted_at")
          .in("id", postIds)
      : { data: [], error: null };

    if (postsError) return NextResponse.json({ error: "Không thể tải nội dung báo cáo." }, { status: 500 });
    const postMap = new Map((posts ?? []).map((post) => [post.id, post]));
    return NextResponse.json({
      reports: (data ?? []).map((report) => ({ ...report, post: postMap.get(report.post_id) ?? null })),
    });
  }

  const reports = await getReports(status || undefined);
  return NextResponse.json({ reports });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Bạn không có quyền xử lý báo cáo." }, { status: 403 });
  }

  const parsed = moderationReportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu xử lý báo cáo không hợp lệ." }, { status: 422 });
  }

  if (env.NEXT_PUBLIC_DEMO_MODE) {
    const { resolveReport, moderatePost } = await import("@/features/moderation");
    if (parsed.data.action !== "dismiss") {
      const report = (await getReports()).find((item) => item.id === parsed.data.report_id);
      if (!report) return NextResponse.json({ error: "Báo cáo không tồn tại." }, { status: 404 });
      await moderatePost({ adminId: user.id, postId: report.post_id, action: parsed.data.action });
    }
    const result = await resolveReport({
      adminId: user.id,
      reportId: parsed.data.report_id,
      status: parsed.data.action === "dismiss" ? "dismissed" : "actioned",
      actionTaken: parsed.data.action,
      moderatorNote: parsed.data.moderator_note,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = createAdminClient();
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, post_id")
      .eq("id", parsed.data.report_id)
      .maybeSingle();

    if (reportError) throw reportError;
    if (!report) return NextResponse.json({ error: "Báo cáo không tồn tại." }, { status: 404 });

    const action = parsed.data.action;
    let post: { id: string; submission_id: string | null } | null = null;

    if (action !== "dismiss") {
      const { data: postData, error: postError } = await supabase
        .from("posts_public")
        .select("id, submission_id")
        .eq("id", report.post_id)
        .maybeSingle();
      if (postError) throw postError;
      if (!postData) return NextResponse.json({ error: "Bài viết đã không còn tồn tại." }, { status: 404 });
      post = postData;

      const { error: postUpdateError } = await supabase
        .from("posts_public")
        .update({
          status: action === "hide" ? "hidden" : "deleted",
          deleted_at: action === "delete" ? new Date().toISOString() : null,
        })
        .eq("id", report.post_id);
      if (postUpdateError) throw postUpdateError;
    }

    const actionTaken = action === "dismiss" ? "dismissed" : action;
    const { data: updatedReport, error: updateReportError } = await supabase
      .from("reports")
      .update({
        status: action === "dismiss" ? "dismissed" : "actioned",
        action_taken: actionTaken,
        moderator_note: parsed.data.moderator_note || null,
      })
      .eq("id", report.id)
      .select("id, post_id, reporter_id, reason, details, status, moderator_note, action_taken, created_at, updated_at")
      .single();
    if (updateReportError) throw updateReportError;

    if (post) {
      await supabase.from("moderation_audit").insert({
        post_id: post.id,
        submission_id: post.submission_id,
        prompt_version: "moderator-v1",
        model: "moderator",
        decision: action,
        flags: {},
        token_usage: {},
      });
    }
    await supabase.from("admin_access_audit").insert({
      admin_id: user.id,
      resource_type: "report",
      resource_id: report.id,
      action: actionTaken,
      reason: parsed.data.moderator_note || "Manual report review",
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("API /api/reports PATCH error:", error);
    return NextResponse.json({ error: "Không thể cập nhật báo cáo lúc này." }, { status: 500 });
  }
}
