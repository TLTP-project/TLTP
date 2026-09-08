import { randomUUID } from "node:crypto";
import { env } from "$lib/config/env";
import { mockDatabase } from "$lib/db";
import { sql } from "$lib/server/db";
import { updateReportStatus } from "@/features/reports";
import { getPostById } from "$lib/server/repository";
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

export async function moderatePost(input: ModerationActionInput): Promise<{ success: boolean; error?: string }> {
  const existing = await getPostById(input.postId);
  if (!existing) return { success: false, error: "Bài viết không tìm thấy." };
  const newStatus: PostStatus = input.action === "hide" ? "hidden" : input.action === "delete" ? "deleted" : "published";
  const deletedAt = newStatus === "deleted" ? new Date().toISOString() : null;

  if (env.DEMO_MODE || !env.DATABASE_URL) {
    const post = mockDatabase.posts.find((item) => item.id === input.postId);
    if (!post) return { success: false, error: "Bài viết không tìm thấy." };
    post.status = newStatus;
    post.deleted_at = deletedAt;
    post.deletion_source = newStatus === "deleted" ? "moderator" : null;
    post.updated_at = new Date().toISOString();
  } else {
    await sql`UPDATE posts_public SET status = ${newStatus}, deleted_at = ${deletedAt}, deletion_source = ${newStatus === "deleted" ? "moderator" : null}, updated_at = NOW() WHERE id = ${input.postId}`;
    await sql`
      INSERT INTO moderation_audit (id, post_id, prompt_version, model, decision, flags, token_usage, created_at)
      VALUES (${randomUUID()}, ${input.postId}, 'moderator', 'human', ${input.action}, ${JSON.stringify(input.note ? { note: input.note } : {})}::jsonb, ${JSON.stringify({})}::jsonb, NOW())
    `;
  }
  return { success: true };
}

export async function resolveReport(input: ResolveReportInput): Promise<{ success: boolean; error?: string }> {
  const updated = await updateReportStatus(input.reportId, input.status, input.moderatorNote, input.actionTaken);
  if (!updated) return { success: false, error: "Báo cáo không tồn tại." };
  if (!env.DEMO_MODE && env.DATABASE_URL) {
    await sql`
      INSERT INTO admin_access_audit (id, user_id, action, source, created_at)
      VALUES (${randomUUID()}, ${input.adminId}, ${`report:${input.status}`}, 'moderation', NOW())
    `;
  }
  return { success: true };
}
