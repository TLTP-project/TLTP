import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Better Auth's PostgreSQL schema. Keep the model and field names aligned with
// the adapter so OAuth account/session records are shared with the app tables.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  email: text("email"),
  role: text("role").notNull().default("student"),
  verificationStatus: text("verification_status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teachers = pgTable("teachers", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  subject: text("subject"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const submissionsPrivate = pgTable("submissions_private", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  target: text("target").notNull(),
  targetTeacherId: text("target_teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  rawText: text("raw_text").notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  model: text("model").notNull(),
  reasoningEffort: text("reasoning_effort").notNull(),
  aiDecision: text("ai_decision").notNull(),
  createdAt: createdAt(),
});

export const postsPublic = pgTable("posts_public", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").references(() => submissionsPrivate.id, { onDelete: "set null" }),
  authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
  processedText: text("processed_text").notNull(),
  displaySender: text("display_sender").notNull(),
  displayTarget: text("display_target").notNull(),
  targetTeacherId: text("target_teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  status: text("status").notNull().default("published"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletionSource: text("deletion_source"),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => postsPublic.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
  role: text("role").notNull(),
  processedText: text("processed_text").notNull(),
  displaySender: text("display_sender").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => postsPublic.id, { onDelete: "cascade" }),
  reporterId: text("reporter_id").references(() => user.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("pending"),
  moderatorNote: text("moderator_note"),
  actionTaken: text("action_taken"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const moderationAudit = pgTable("moderation_audit", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => postsPublic.id, { onDelete: "set null" }),
  submissionId: text("submission_id").references(() => submissionsPrivate.id, { onDelete: "set null" }),
  promptVersion: text("prompt_version").notNull(),
  model: text("model").notNull(),
  decision: text("decision").notNull(),
  flags: jsonb("flags").notNull().default({}),
  tokenUsage: jsonb("token_usage").notNull().default({}),
  createdAt: createdAt(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdmins = pgTable("platform_admins", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  githubLogin: text("github_login"),
  grantSource: text("grant_source").notNull().default("manual"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminAccessAudit = pgTable("admin_access_audit", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  source: text("source"),
  createdAt: createdAt(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  profiles,
  teachers,
  submissionsPrivate,
  postsPublic,
  comments,
  reports,
  moderationAudit,
  rateLimits,
  platformAdmins,
  adminAccessAudit,
};
