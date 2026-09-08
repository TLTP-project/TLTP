import { randomUUID } from "node:crypto";
import { z } from "zod";
import { processFeedbackWithLuna } from "@/features/ai";
import type { CreateSubmissionInput, PostPublic, QuotaStatus, SubmissionPrivate, Teacher } from "@/types";
import { STUDENT_TARGET_LABEL } from "@/types";
import { env } from "$lib/config/env";
import { mockDatabase } from "$lib/db";
import { hashClientIp, validateSubmissionText, verifyTurnstileToken } from "$lib/security";
import { sql } from "$lib/server/db";
import { deletePostForAuthor, listActiveTeachers } from "$lib/server/repository";

export const submissionInputSchema = z.object({
  role: z.enum(["student", "teacher", "school"]),
  target: z.string().optional(),
  target_teacher_id: z.string().uuid().optional().or(z.literal("")),
  text: z.string().min(10, "Nội dung phản hồi tối thiểu 10 ký tự").max(1500, "Nội dung phản hồi tối đa 1,500 ký tự"),
  turnstile_token: z.string().optional(),
});

const mockPrivateSubmissions: SubmissionPrivate[] = [];

export async function checkUserQuota(userId: string, isAdmin = false): Promise<QuotaStatus> {
  // Administrators need to be able to publish repeated moderation/test posts.
  // Keep validation and Turnstile checks in the submission pipeline; this only
  // bypasses the daily per-account quota.
  if (isAdmin) {
    return { can_submit: true, published_today: 0, attempts_today: 0 };
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let publishedToday = 0;
  let attemptsToday = 0;

  if (env.DEMO_MODE || !env.DATABASE_URL) {
    publishedToday = mockDatabase.posts.filter((post) => post.author_id === userId && post.status !== "deleted" && new Date(post.created_at) >= oneDayAgo).length;
    attemptsToday = mockPrivateSubmissions.filter((submission) => submission.author_id === userId && submission.ai_decision !== "processing_failed" && new Date(submission.created_at) >= oneDayAgo).length;
  } else {
    const [published, attempts] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM posts_public WHERE author_id = ${userId} AND status <> 'deleted' AND created_at >= ${oneDayAgo}`,
      sql`SELECT COUNT(*)::int AS count FROM submissions_private WHERE author_id = ${userId} AND ai_decision <> 'processing_failed' AND created_at >= ${oneDayAgo}`,
    ]);
    publishedToday = Number((published[0] as { count: number } | undefined)?.count ?? 0);
    attemptsToday = Number((attempts[0] as { count: number } | undefined)?.count ?? 0);
  }

  if (publishedToday >= 1) return { can_submit: false, published_today: publishedToday, attempts_today: attemptsToday, reason: "DAILY_POST_LIMIT_REACHED" };
  if (attemptsToday >= 3) return { can_submit: false, published_today: publishedToday, attempts_today: attemptsToday, reason: "DAILY_ATTEMPTS_LIMIT_REACHED" };
  return { can_submit: true, published_today: publishedToday, attempts_today: attemptsToday };
}

export interface SubmissionServiceResult {
  success: boolean;
  post?: PostPublic;
  error?: string;
  reason?: "OFF_TOPIC" | "QUOTA_EXCEEDED" | "SECURITY_FAILED" | "PROCESSING_FAILED";
}

async function savePrivateSubmission(record: SubmissionPrivate): Promise<void> {
  await sql`
    INSERT INTO submissions_private
      (id, author_id, role, target, target_teacher_id, raw_text, ip_hash, user_agent, model, reasoning_effort, ai_decision, created_at)
    VALUES
      (${record.id}, ${record.author_id}, ${record.role}, ${record.target}, ${record.target_teacher_id}, ${record.raw_text}, ${record.ip_hash}, ${record.user_agent}, ${record.model}, ${record.reasoning_effort}, ${record.ai_decision}, ${record.created_at})
  `;
}

async function saveAudit(params: { postId?: string; submissionId: string; model: string; decision: string; notes?: string }): Promise<void> {
  await sql`
    INSERT INTO moderation_audit
      (id, post_id, submission_id, prompt_version, model, decision, flags, token_usage, created_at)
    VALUES
      (${randomUUID()}, ${params.postId ?? null}, ${params.submissionId}, 'v1', ${params.model}, ${params.decision}, ${JSON.stringify(params.notes ? { reasoning_notes: params.notes } : {})}::jsonb, ${JSON.stringify({})}::jsonb, NOW())
  `;
}

export async function submitFeedback(
  userId: string,
  input: CreateSubmissionInput,
  clientIp?: string,
  clientUserAgent?: string,
  isAdmin = false,
): Promise<SubmissionServiceResult> {
  const validation = submissionInputSchema.safeParse(input);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message || "Dữ liệu không hợp lệ" };

  const textValidation = validateSubmissionText(input.text);
  if (!textValidation.valid) return { success: false, error: textValidation.error };

  const turnstileCheck = await verifyTurnstileToken(input.turnstile_token, clientIp);
  if (!turnstileCheck.success) return { success: false, reason: "SECURITY_FAILED", error: turnstileCheck.error };

  const quota = await checkUserQuota(userId, isAdmin);
  if (!quota.can_submit) {
    return {
      success: false,
      reason: "QUOTA_EXCEEDED",
      error: quota.reason === "DAILY_POST_LIMIT_REACHED"
        ? "Bạn đã đăng 1 bài viết trong hôm nay. Mỗi tài khoản được đăng tối đa 1 bài/ngày."
        : "Bạn đã dùng hết 3 lượt xử lý AI trong 24 giờ qua.",
    };
  }

  let teacherCandidates: Teacher[] = [];
  try {
    teacherCandidates = await listActiveTeachers();
  } catch (error) {
    console.error("Failed to load teacher candidates:", error);
    return { success: false, reason: "PROCESSING_FAILED", error: "Không thể tải danh sách giáo viên để AI nhận diện." };
  }

  const canonicalTarget = input.role === "student" ? "Giáo viên được AI nhận diện" : STUDENT_TARGET_LABEL;
  const submissionId = env.DEMO_MODE || !env.DATABASE_URL ? `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : randomUUID();
  const privateRecord: SubmissionPrivate = {
    id: submissionId,
    author_id: userId,
    role: input.role,
    target: canonicalTarget,
    target_teacher_id: null,
    raw_text: input.text,
    ip_hash: hashClientIp(clientIp),
    user_agent: clientUserAgent,
    model: env.OPENAI_MODEL,
    reasoning_effort: env.OPENAI_REASONING_EFFORT,
    ai_decision: "publish",
    created_at: new Date().toISOString(),
  };

  try {
    const aiResult = await processFeedbackWithLuna({ role: input.role, target: canonicalTarget, teachers: teacherCandidates, text: input.text });
    privateRecord.target = aiResult.displayTarget;
    privateRecord.target_teacher_id = aiResult.targetTeacherId || null;

    if (aiResult.decision === "nothing" || !aiResult.publicText) {
      privateRecord.ai_decision = "nothing";
      if (env.DEMO_MODE || !env.DATABASE_URL) mockPrivateSubmissions.push(privateRecord);
      else {
        await savePrivateSubmission(privateRecord);
        try { await saveAudit({ submissionId, model: privateRecord.model, decision: "nothing", notes: aiResult.reasoningNotes }); } catch (auditError) { console.error("Failed to write moderation audit:", auditError); }
      }
      return { success: false, reason: "OFF_TOPIC", error: "Nội dung chưa liên quan đến phản hồi học đường hoặc không thuộc phạm vi trường học." };
    }

    const now = new Date().toISOString();
    const newPost: PostPublic = {
      id: env.DEMO_MODE || !env.DATABASE_URL ? `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` : randomUUID(),
      submission_id: submissionId,
      author_id: userId,
      processed_text: aiResult.publicText,
      display_sender: aiResult.displaySender,
      display_target: aiResult.displayTarget,
      target_teacher_id: aiResult.targetTeacherId || null,
      status: "published",
      created_at: now,
      updated_at: now,
    };

    if (env.DEMO_MODE || !env.DATABASE_URL) {
      mockDatabase.posts.unshift(newPost);
      mockPrivateSubmissions.push(privateRecord);
    } else {
      await savePrivateSubmission(privateRecord);
      await sql`
        INSERT INTO posts_public
          (id, submission_id, author_id, processed_text, display_sender, display_target, target_teacher_id, status, created_at, updated_at)
        VALUES
          (${newPost.id}, ${newPost.submission_id}, ${newPost.author_id}, ${newPost.processed_text}, ${newPost.display_sender}, ${newPost.display_target}, ${newPost.target_teacher_id}, 'published', ${newPost.created_at}, ${newPost.updated_at})
      `;
      try { await saveAudit({ postId: newPost.id, submissionId, model: privateRecord.model, decision: "publish", notes: aiResult.reasoningNotes }); } catch (auditError) { console.error("Failed to write moderation audit:", auditError); }
    }

    return { success: true, post: newPost };
  } catch (error) {
    console.error("Submission processing error:", error);
    privateRecord.ai_decision = "processing_failed";
    if (env.DEMO_MODE || !env.DATABASE_URL) mockPrivateSubmissions.push(privateRecord);
    else {
      try {
        await sql`
          INSERT INTO submissions_private
            (id, author_id, role, target, target_teacher_id, raw_text, ip_hash, user_agent, model, reasoning_effort, ai_decision, created_at)
          VALUES
            (${privateRecord.id}, ${privateRecord.author_id}, ${privateRecord.role}, ${privateRecord.target}, ${privateRecord.target_teacher_id}, ${privateRecord.raw_text}, ${privateRecord.ip_hash}, ${privateRecord.user_agent}, ${privateRecord.model}, ${privateRecord.reasoning_effort}, 'processing_failed', ${privateRecord.created_at})
          ON CONFLICT (id) DO UPDATE SET ai_decision = 'processing_failed'
        `;
      } catch (recoveryError) { console.error("Failed to record failed submission:", recoveryError); }
    }
    return { success: false, reason: "PROCESSING_FAILED", error: "Hệ thống xử lý AI tạm thời gián đoạn. Vui lòng thử lại sau ít phút." };
  }
}

export async function softDeletePost(userId: string, postId: string): Promise<{ success: boolean; error?: string }> {
  const deleted = await deletePostForAuthor(userId, postId);
  return deleted ? { success: true } : { success: false, error: "Bài viết không tồn tại hoặc không thuộc về bạn" };
}
