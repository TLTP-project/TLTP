export type UserRole = "student" | "teacher" | "school";

/** Canonical anonymous target for teacher/school feedback. */
export const STUDENT_TARGET_LABEL = "Học sinh / lớp học";

export type VerificationStatus = "active" | "pending_verification" | "rejected";

export interface Profile {
  user_id: string;
  email?: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  display_name: string;
  subject?: string | null;
  active: boolean;
  created_at: string;
}

export type AiDecision = "publish" | "nothing" | "processing_failed";

export interface AiRewriteResult {
  decision: "publish" | "nothing";
  public_text: string | null;
  /** Teacher name identified by the AI from the submitted text, or null. */
  teacher_name?: string | null;
  meaning_preserved?: boolean;
  display_sender?: string;
  display_target?: string;
  reasoning_notes?: string;
}

export type PostStatus = "published" | "hidden" | "deleted";

export interface PostPublic {
  id: string;
  submission_id?: string | null;
  author_id?: string | null;
  processed_text: string;
  display_sender: string;
  display_target: string;
  target_teacher_id?: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deletion_source?: "author" | "moderator" | null;
}

export interface CommentPublic {
  id: string;
  post_id: string;
  author_id?: string | null;
  processed_text: string;
  display_sender: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SubmissionPrivate {
  id: string;
  author_id: string;
  role: UserRole;
  target: string;
  target_teacher_id?: string | null;
  raw_text: string;
  ip_hash?: string | null;
  user_agent?: string | null;
  model: string;
  reasoning_effort: string;
  ai_decision: AiDecision;
  created_at: string;
}

export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface Report {
  id: string;
  post_id: string;
  reporter_id?: string | null;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  moderator_note?: string | null;
  action_taken?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotaStatus {
  can_submit: boolean;
  published_today: number;
  attempts_today: number;
  reason?: "DAILY_POST_LIMIT_REACHED" | "DAILY_ATTEMPTS_LIMIT_REACHED" | null;
}

export interface CreateSubmissionInput {
  role: UserRole;
  /** Kept optional for backwards-compatible clients; the server now infers the target. */
  target?: string;
  target_teacher_id?: string;
  text: string;
  turnstile_token?: string;
}
