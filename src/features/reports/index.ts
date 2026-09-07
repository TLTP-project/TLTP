import { z } from "zod";
import { mockDatabase } from "@/lib/db";
import type { Report, ReportStatus } from "@/types";

export const createReportSchema = z.object({
  post_id: z.string().min(1, "Thiếu mã bài viết"),
  reason: z.enum(["harassment", "pii_leak", "safety_threat", "misinformation", "other"], {
    errorMap: () => ({ message: "Vui lòng chọn lý do báo cáo hợp lệ" }),
  }),
  details: z.string().max(500, "Chi tiết không quá 500 ký tự").optional(),
});

// In-memory reports store
export const mockReports: Report[] = [
  {
    id: "rep-1",
    post_id: "post-103",
    reporter_id: "user-student-demo",
    reason: "other",
    details: "Cần bổ sung thêm thông tin về giờ mở cửa phòng thí nghiệm.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export async function submitReport(
  reporterId: string | null,
  input: z.infer<typeof createReportSchema>
): Promise<{ success: boolean; report?: Report; error?: string }> {
  const parsed = createReportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const post = mockDatabase.posts.find((p) => p.id === input.post_id);
  if (!post) {
    return { success: false, error: "Bài viết không tồn tại để báo cáo." };
  }

  const newReport: Report = {
    id: `rep-${Date.now()}`,
    post_id: input.post_id,
    reporter_id: reporterId,
    reason: input.reason,
    details: input.details,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockReports.unshift(newReport);
  return { success: true, report: newReport };
}

export async function getReports(status?: ReportStatus): Promise<Report[]> {
  if (!status) return mockReports;
  return mockReports.filter((r) => r.status === status);
}
