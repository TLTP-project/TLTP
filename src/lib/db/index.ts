import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";
import type { PostPublic, Teacher } from "@/types";

// Public / Browser client
export function createBrowserClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

// Server Admin client (Service role - bypasses RLS for trusted backend operations)
export function createAdminClient() {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// In-memory mock data store for local dev when Supabase is not connected
export const mockDatabase = {
  teachers: [
    { id: "11111111-1111-1111-1111-111111111111", display_name: "Thầy Nguyễn Văn A", subject: "Toán học", active: true, created_at: new Date().toISOString() },
    { id: "22222222-2222-2222-2222-222222222222", display_name: "Cô Trần Thị B", subject: "Ngữ văn", active: true, created_at: new Date().toISOString() },
    { id: "33333333-3333-3333-3333-333333333333", display_name: "Thầy Lê Văn C", subject: "Vật lý", active: true, created_at: new Date().toISOString() },
    { id: "44444444-4444-4444-4444-444444444444", display_name: "Cô Phạm Thị D", subject: "Tiếng Anh", active: true, created_at: new Date().toISOString() },
    { id: "55555555-5555-5555-5555-555555555555", display_name: "Thầy Hoàng Văn E", subject: "Hóa học", active: true, created_at: new Date().toISOString() },
  ] as Teacher[],
  posts: [
    {
      id: "post-101",
      processed_text: "Thầy giảng bài rất nhiệt huyết và dễ hiểu, em hy vọng thầy có thể cho thêm nhiều bài tập nâng cao để rèn luyện tư duy hơn nữa.",
      display_sender: "Student meow meow",
      display_target: "Thầy Nguyễn Văn A",
      target_teacher_id: "11111111-1111-1111-1111-111111111111",
      status: "published",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "post-102",
      processed_text: "Tiết học văn của cô rất truyền cảm hứng. Em mong cô có thể gợi ý thêm một số đầu sách hay để đọc thêm ngoài giờ học.",
      display_sender: "Student puppy",
      display_target: "Cô Trần Thị B",
      target_teacher_id: "22222222-2222-2222-2222-222222222222",
      status: "published",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "post-103",
      processed_text: "Phòng thí nghiệm vật lý cần được trang bị thêm một số dụng cụ đo đạc mới để các bạn học sinh có thể thực hành chuẩn xác hơn.",
      display_sender: "Student bunny",
      display_target: "Thầy Lê Văn C",
      target_teacher_id: "33333333-3333-3333-3333-333333333333",
      status: "published",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ] as PostPublic[],
};
