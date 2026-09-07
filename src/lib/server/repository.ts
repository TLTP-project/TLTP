import type { PostPublic, Teacher } from "@/types";
import { env } from "$lib/config/env";
import { mockDatabase } from "$lib/db";
import { sql } from "$lib/server/db";

function mapTeacher(row: Record<string, unknown>): Teacher {
  return {
    id: String(row.id),
    display_name: String(row.display_name),
    subject: row.subject ? String(row.subject) : null,
    active: Boolean(row.active),
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

function mapPost(row: Record<string, unknown>): PostPublic {
  return {
    id: String(row.id),
    submission_id: row.submission_id ? String(row.submission_id) : null,
    author_id: row.author_id ? String(row.author_id) : null,
    processed_text: String(row.processed_text),
    display_sender: String(row.display_sender),
    display_target: String(row.display_target),
    target_teacher_id: row.target_teacher_id ? String(row.target_teacher_id) : null,
    status: row.status as PostPublic["status"],
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
    deleted_at: row.deleted_at ? new Date(String(row.deleted_at)).toISOString() : null,
  };
}

export async function listActiveTeachers(): Promise<Teacher[]> {
  if (env.DEMO_MODE || !env.DATABASE_URL) return mockDatabase.teachers.filter((teacher) => teacher.active);
  const rows = await sql`
    SELECT id, display_name, subject, active, created_at
    FROM teachers WHERE active = TRUE ORDER BY display_name ASC
  `;
  return rows.map((row) => mapTeacher(row as Record<string, unknown>));
}

export async function listPublishedPosts(limit = 50): Promise<PostPublic[]> {
  if (env.DEMO_MODE || !env.DATABASE_URL) {
    return mockDatabase.posts.filter((post) => post.status === "published").slice(0, limit);
  }
  const rows = await sql`
    SELECT id, submission_id, author_id, processed_text, display_sender,
      display_target, target_teacher_id, status, created_at, updated_at, deleted_at
    FROM posts_public
    WHERE status = 'published'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => mapPost(row as Record<string, unknown>));
}

export async function getPostById(postId: string): Promise<PostPublic | null> {
  if (env.DEMO_MODE || !env.DATABASE_URL) {
    return mockDatabase.posts.find((post) => post.id === postId && post.status !== "deleted") ?? null;
  }
  const rows = await sql`
    SELECT id, submission_id, author_id, processed_text, display_sender,
      display_target, target_teacher_id, status, created_at, updated_at, deleted_at
    FROM posts_public WHERE id = ${postId} AND status <> 'deleted' LIMIT 1
  `;
  return rows[0] ? mapPost(rows[0] as Record<string, unknown>) : null;
}

export async function listPostsByAuthor(authorId: string): Promise<PostPublic[]> {
  if (env.DEMO_MODE || !env.DATABASE_URL) {
    return mockDatabase.posts.filter((post) => post.author_id === authorId && post.status !== "deleted");
  }
  const rows = await sql`
    SELECT id, submission_id, author_id, processed_text, display_sender,
      display_target, target_teacher_id, status, created_at, updated_at, deleted_at
    FROM posts_public WHERE author_id = ${authorId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => mapPost(row as Record<string, unknown>));
}

export async function deletePostForAuthor(authorId: string, postId: string): Promise<boolean> {
  if (env.DEMO_MODE || !env.DATABASE_URL) {
    const post = mockDatabase.posts.find((item) => item.id === postId && item.author_id === authorId);
    if (!post) return false;
    post.status = "deleted";
    post.deleted_at = new Date().toISOString();
    post.updated_at = new Date().toISOString();
    return true;
  }
  const rows = await sql`
    UPDATE posts_public
    SET status = 'deleted', deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${postId} AND author_id = ${authorId}
    RETURNING id
  `;
  return rows.length > 0;
}
