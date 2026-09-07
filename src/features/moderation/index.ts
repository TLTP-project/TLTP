import { mockDatabase } from "@/lib/db";
import { mockReports } from "@/features/reports";
import type { PostStatus, ReportStatus } from "@/types";

export interface ModerationActionInput {
  adminId: string;
  postId: string;
  action: "hide" | "restore" | "delete";
  note?: string;
}

export interface ResolveReportInput {
  adminId: string;
  reportId: string;
  status: ReportStatus;
  actionTaken?: string;
  moderatorNote?: string;
}

/**
 * Moderation actions on a public post (hide, restore, delete)
 */
export async function moderatePost(
  input: ModerationActionInput
): Promise<{ success: boolean; error?: string }> {
  const post = mockDatabase.posts.find((p) => p.id === input.postId);
  if (!post) {
    return { success: false, error: "Bài viết không tìm thấy." };
  }

  let newStatus: PostStatus;
  if (input.action === "hide") {
    newStatus = "hidden";
  } else if (input.action === "delete") {
    newStatus = "deleted";
    post.deleted_at = new Date().toISOString();
  } else {
    newStatus = "published";
    post.deleted_at = null;
  }

  post.status = newStatus;
  post.updated_at = new Date().toISOString();

  return { success: true };
}

/**
 * Updates a report's status and moderator notes
 */
export async function resolveReport(
  input: ResolveReportInput
): Promise<{ success: boolean; error?: string }> {
  const report = mockReports.find((r) => r.id === input.reportId);
  if (!report) {
    return { success: false, error: "Báo cáo không tồn tại." };
  }

  report.status = input.status;
  report.action_taken = input.actionTaken;
  report.moderator_note = input.moderatorNote;
  report.updated_at = new Date().toISOString();

  return { success: true };
}
