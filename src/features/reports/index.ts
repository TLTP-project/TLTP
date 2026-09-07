import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "$lib/config/env";
import { mockDatabase } from "$lib/db";
import { sql } from "$lib/server/db";
import { getPostById } from "$lib/server/repository";
import type { Report, ReportStatus } from "@/types";

export const createReportSchema = z.object({
  post_id: z.string().min(1, "Thiếu mã bài viết"),
  reason: z.enum(["harassment", "pii_leak", "safety_threat", "misinformation", "other"], { error: "Vui lòng chọn lý do báo cáo hợp lệ" }),
  details: z.string().max(500, "Chi tiết không quá 500 ký tự").optional(),
});

export const mockReports: Report[] = [
  {
    id: "rep-1",
    post_id: "post-102",
    reporter_id: "user-student-demo",
    reason: "other",
    details: "Cần xác minh rõ hơn về barem điểm bài thi giữa kỳ.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

function mapReport(row: Record<string, unknown>): Report {
  return {
    id: String(row.id),
    post_id: String(row.post_id),
    reporter_id: row.reporter_id ? String(row.reporter_id) : null,
    reason: String(row.reason),
    details: row.details ? String(row.details) : null,
    status: String(row.status) as ReportStatus,
    moderator_note: row.moderator_note ? String(row.moderator_note) : null,
    action_taken: row.action_taken ? String(row.action_taken) : null,
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function submitReport(reporterId: string | null, input: unknown): Promise<{ success: boolean; report?: Report; error?: string }> {
  const parsed = createReportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const post = await getPostById(parsed.data.post_id);
  if (!post) return { success: false, error: "Bài viết không tồn tại để báo cáo." };

  const now = new Date().toISOString();
  const report: Report = {
    id: env.DEMO_MODE || !env.DATABASE_URL ? `rep-${Date.now()}` : randomUUID(),
    post_id: parsed.data.post_id,
    reporter_id: reporterId,
    reason: parsed.data.reason,
    details: parsed.data.details,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  if (env.DEMO_MODE || !env.DATABASE_URL) {
    mockReports.unshift(report);
  } else {
    await sql`
      INSERT INTO reports (id, post_id, reporter_id, reason, details, status, created_at, updated_at)
      VALUES (${report.id}, ${report.post_id}, ${reporterId}, ${report.reason}, ${report.details ?? null}, 'pending', ${now}, ${now})
    `;
  }
  return { success: true, report };
}

export async function getReports(status?: ReportStatus): Promise<Report[]> {
  if (env.DEMO_MODE || !env.DATABASE_URL) return status ? mockReports.filter((report) => report.status === status) : mockReports;
  const rows = status
    ? await sql`SELECT id, post_id, reporter_id, reason, details, status, moderator_note, action_taken, created_at, updated_at FROM reports WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT id, post_id, reporter_id, reason, details, status, moderator_note, action_taken, created_at, updated_at FROM reports ORDER BY created_at DESC`;
  return rows.map((row) => mapReport(row as Record<string, unknown>));
}

export async function updateReportStatus(reportId: string, status: ReportStatus, moderatorNote?: string, actionTaken?: string): Promise<boolean> {
  if (env.DEMO_MODE || !env.DATABASE_URL) {
    const report = mockReports.find((item) => item.id === reportId);
    if (!report) return false;
    report.status = status;
    report.moderator_note = moderatorNote;
    report.action_taken = actionTaken;
    report.updated_at = new Date().toISOString();
    return true;
  }
  const rows = await sql`
    UPDATE reports SET status = ${status}, moderator_note = ${moderatorNote ?? null}, action_taken = ${actionTaken ?? null}, updated_at = NOW()
    WHERE id = ${reportId} RETURNING id
  `;
  return rows.length > 0;
}
