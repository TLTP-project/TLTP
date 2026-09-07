import { z } from "zod";
import { processFeedbackWithLuna } from "@/features/ai";
import { verifyTurnstileToken, validateSubmissionText } from "@/lib/security";
import { mockDatabase } from "@/lib/db";
import type {
  PostPublic,
  SubmissionPrivate,
  QuotaStatus,
  CreateSubmissionInput,
} from "@/types";

export const submissionInputSchema = z.object({
  role: z.enum(["student", "teacher", "school"]),
  target: z.string().min(1, "Vui lòng chọn đối tượng phản hồi"),
  target_teacher_id: z.string().uuid().optional().or(z.literal("")),
  text: z.string().min(10, "Nội dung phản hồi tối thiểu 10 ký tự").max(1500, "Nội dung phản hồi tối đa 1,500 ký tự"),
  turnstile_token: z.string().optional(),
});

// In-memory submissions store for mock fallback
const mockPrivateSubmissions: SubmissionPrivate[] = [];

/**
 * Checks daily submission quota for an authenticated user:
 * - Max 1 public post per 24 hours
 * - Max 3 AI processing attempts per 24 hours
 */
export async function checkUserQuota(userId: string): Promise<QuotaStatus> {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const publishedToday = mockDatabase.posts.filter(
    (p) =>
      p.author_id === userId &&
      p.status !== "deleted" &&
      new Date(p.created_at).getTime() >= oneDayAgo
  ).length;

  const attemptsToday = mockPrivateSubmissions.filter(
    (s) =>
      s.author_id === userId &&
      s.ai_decision !== "processing_failed" &&
      new Date(s.created_at).getTime() >= oneDayAgo
  ).length;

  if (publishedToday >= 1) {
    return {
      can_submit: false,
      published_today: publishedToday,
      attempts_today: attemptsToday,
      reason: "DAILY_POST_LIMIT_REACHED",
    };
  }

  if (attemptsToday >= 3) {
    return {
      can_submit: false,
      published_today: publishedToday,
      attempts_today: attemptsToday,
      reason: "DAILY_ATTEMPTS_LIMIT_REACHED",
    };
  }

  return {
    can_submit: true,
    published_today: publishedToday,
    attempts_today: attemptsToday,
  };
}

export interface SubmissionServiceResult {
  success: boolean;
  post?: PostPublic;
  error?: string;
  reason?: "OFF_TOPIC" | "QUOTA_EXCEEDED" | "SECURITY_FAILED" | "PROCESSING_FAILED";
}

/**
 * Creates and publishes a submission according to PLAN.md section 3 & 4:
 * 1. Validate inputs
 * 2. Check bot protection (Turnstile)
 * 3. Check daily quota
 * 4. Call Luna AI once
 * 5. Publish immediately if relevant; reject if off-topic
 */
export async function submitFeedback(
  userId: string,
  input: CreateSubmissionInput,
  clientIp?: string
): Promise<SubmissionServiceResult> {
  // 1. Validate payload
  const validation = submissionInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Dữ liệu không hợp lệ",
    };
  }

  const textValidation = validateSubmissionText(input.text);
  if (!textValidation.valid) {
    return {
      success: false,
      error: textValidation.error,
    };
  }

  // 2. Verify Turnstile token
  const turnstileCheck = await verifyTurnstileToken(input.turnstile_token, clientIp);
  if (!turnstileCheck.success) {
    return {
      success: false,
      reason: "SECURITY_FAILED",
      error: turnstileCheck.error,
    };
  }

  // 3. Quota check
  const quota = await checkUserQuota(userId);
  if (!quota.can_submit) {
    const errorMsg =
      quota.reason === "DAILY_POST_LIMIT_REACHED"
        ? "Bạn đã đăng 1 bài viết trong hôm nay. Mỗi tài khoản được đăng tối đa 1 bài/ngày."
        : "Bạn đã dùng hết 3 lượt xử lý AI trong 24 giờ qua.";
    return {
      success: false,
      reason: "QUOTA_EXCEEDED",
      error: errorMsg,
    };
  }

  // Find target teacher name if applicable
  let teacherName: string | undefined;
  if (input.target_teacher_id) {
    const teacher = mockDatabase.teachers.find(
      (t) => t.id === input.target_teacher_id && t.active
    );
    if (!teacher) {
      return {
        success: false,
        error: "Giáo viên được chọn không tồn tại hoặc đã ngừng công tác.",
      };
    }
    teacherName = teacher.display_name;
  }

  // 4. Record submission attempt in private store
  const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const privateRecord: SubmissionPrivate = {
    id: submissionId,
    author_id: userId,
    role: input.role,
    target: input.target,
    target_teacher_id: input.target_teacher_id,
    raw_text: input.text,
    ip_hash: clientIp ? `ip_${clientIp.slice(0, 5)}` : null,
    model: "gpt-5.6-luna",
    reasoning_effort: "high",
    ai_decision: "publish",
    created_at: new Date().toISOString(),
  };

  try {
    // 5. Call Luna AI pipeline
    const aiResult = await processFeedbackWithLuna({
      role: input.role,
      target: input.target,
      teacherName,
      text: input.text,
    });

    if (aiResult.decision === "nothing" || !aiResult.publicText) {
      privateRecord.ai_decision = "nothing";
      mockPrivateSubmissions.push(privateRecord);
      return {
        success: false,
        reason: "OFF_TOPIC",
        error: "Nội dung chưa liên quan đến phản hồi học đường hoặc không thuộc phạm vi trường học.",
      };
    }

    // 6. Relevant -> Publish immediately
    const newPost: PostPublic = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      submission_id: submissionId,
      author_id: userId,
      processed_text: aiResult.publicText,
      display_sender: aiResult.displaySender,
      display_target: aiResult.displayTarget,
      target_teacher_id: input.target_teacher_id,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDatabase.posts.unshift(newPost);
    mockPrivateSubmissions.push(privateRecord);

    return {
      success: true,
      post: newPost,
    };
  } catch (err) {
    console.error("Submission processing error:", err);
    privateRecord.ai_decision = "processing_failed";
    mockPrivateSubmissions.push(privateRecord);
    return {
      success: false,
      reason: "PROCESSING_FAILED",
      error: "Hệ thống xử lý AI tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
    };
  }
}

/**
 * Soft deletes a post (Keep / Delete action from author).
 */
export async function softDeletePost(
  userId: string,
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const post = mockDatabase.posts.find((p) => p.id === postId);
  if (!post) {
    return { success: false, error: "Bài viết không tồn tại" };
  }

  // Strict ownership check: only author can delete
  if (!post.author_id || post.author_id !== userId) {
    return { success: false, error: "Bạn không có quyền xóa bài viết này" };
  }

  post.status = "deleted";
  post.deleted_at = new Date().toISOString();
  post.updated_at = new Date().toISOString();

  return { success: true };
}
