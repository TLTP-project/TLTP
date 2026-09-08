import { randomUUID } from "node:crypto";
import { z } from "zod";
import { processFeedbackWithLuna } from "@/features/ai";
import type { CommentPublic, UserRole } from "@/types";
import { env } from "$lib/config/env";
import { mockDatabase } from "$lib/db";
import { sql } from "$lib/server/db";
import { checkPersistentRateLimit, validateSubmissionText, verifyTurnstileToken } from "$lib/security";
import { getPostById } from "$lib/server/repository";

const COMMENT_RATE_LIMIT = 30;
const COMMENT_RATE_WINDOW_SECONDS = 24 * 60 * 60;

export const commentInputSchema = z.object({
  text: z.string().min(10, "Bình luận tối thiểu 10 ký tự").max(1000, "Bình luận tối đa 1.000 ký tự"),
  turnstile_token: z.string().optional(),
});

export interface CreateCommentInput {
  text: string;
  turnstile_token?: string;
}

export interface CommentServiceResult {
  success: boolean;
  comment?: CommentPublic;
  error?: string;
  reason?: "OFF_TOPIC" | "RATE_LIMITED" | "SECURITY_FAILED" | "PROCESSING_FAILED";
}

export async function createComment(
  postId: string,
  userId: string,
  role: UserRole,
  input: unknown,
  clientIp?: string,
  isAdmin = false,
): Promise<CommentServiceResult> {
  const parsed = commentInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Bình luận không hợp lệ." };

  const post = await getPostById(postId);
  if (!post || post.status !== "published") return { success: false, error: "Bài viết không còn nhận bình luận." };

  const textValidation = validateSubmissionText(parsed.data.text);
  if (!textValidation.valid) return { success: false, error: textValidation.error?.replace("phản hồi", "bình luận") };

  const turnstileCheck = await verifyTurnstileToken(parsed.data.turnstile_token, clientIp);
  if (!turnstileCheck.success) return { success: false, reason: "SECURITY_FAILED", error: turnstileCheck.error };

  if (!isAdmin) {
    const rate = await checkPersistentRateLimit(`comment:user:${userId}`, COMMENT_RATE_LIMIT, COMMENT_RATE_WINDOW_SECONDS);
    if (!rate.allowed) return { success: false, reason: "RATE_LIMITED", error: "Bạn đã bình luận quá nhiều lần. Vui lòng thử lại sau." };
  }

  try {
    const aiResult = await processFeedbackWithLuna({ role, target: "Bình luận cho bài viết", text: parsed.data.text });
    if (aiResult.decision === "nothing" || !aiResult.publicText) {
      return { success: false, reason: "OFF_TOPIC", error: "Bình luận chưa phù hợp với nội dung bài viết." };
    }

    const now = new Date().toISOString();
    const comment: CommentPublic = {
      id: env.DEMO_MODE || !env.DATABASE_URL ? `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : randomUUID(),
      post_id: postId,
      author_id: null,
      processed_text: aiResult.publicText,
      display_sender: aiResult.displaySender,
      status: "published",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    if (env.DEMO_MODE || !env.DATABASE_URL) {
      mockDatabase.comments.push(comment);
    } else {
      await sql`
        INSERT INTO comments
          (id, post_id, author_id, role, processed_text, display_sender, status, created_at, updated_at)
        VALUES
          (${comment.id}, ${comment.post_id}, ${userId}, ${role}, ${comment.processed_text}, ${comment.display_sender}, 'published', ${comment.created_at}, ${comment.updated_at})
      `;
      try {
        await sql`
          INSERT INTO moderation_audit
            (id, post_id, submission_id, prompt_version, model, decision, flags, token_usage, created_at)
          VALUES
            (${randomUUID()}, ${postId}, NULL, 'comment-v1', ${env.OPENAI_MODEL}, 'publish', ${JSON.stringify({ reasoning_notes: aiResult.reasoningNotes ?? null })}::jsonb, ${JSON.stringify({})}::jsonb, NOW())
        `;
      } catch (auditError) {
        console.error("Failed to write comment moderation audit:", auditError);
      }
    }

    return { success: true, comment };
  } catch (error) {
    console.error("Comment processing error:", error);
    return { success: false, reason: "PROCESSING_FAILED", error: "Hệ thống xử lý bình luận tạm thời gián đoạn. Vui lòng thử lại sau." };
  }
}
