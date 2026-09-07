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
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for trusted server-side database operations."
    );
  }

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
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
      author_id: "user-student-demo",
      processed_text: "Thầy kiểm tra bài cũ đầu giờ với thái độ khá gay gắt và thường so sánh các bạn chưa thuộc bài với học sinh lớp chọn trước mặt cả lớp, khiến chúng em cảm thấy xấu hổ và rất áp lực tâm lý mỗi khi đến tiết Toán. Em hiểu thầy muốn chúng em chăm chỉ hơn, nhưng rất mong thầy có thể nhắc nhở nhẹ nhàng hoặc góp ý riêng để chúng em có thêm động lực học tập.",
      display_sender: "Student meow meow",
      display_target: "Thầy Nguyễn Văn A",
      target_teacher_id: "11111111-1111-1111-1111-111111111111",
      status: "published",
      created_at: "2026-09-07T09:15:00.000Z",
      updated_at: "2026-09-07T09:15:00.000Z",
    },
    {
      id: "post-102",
      processed_text: "Về bài kiểm tra giữa kỳ môn Văn vừa rồi, em nhận thấy cách chấm điểm dường như có sự chênh lệch khá lớn giữa các bạn trong đội tuyển học sinh giỏi và các bạn còn lại dù có cùng luận điểm làm bài. Em rất mong cô có thể công khai barem điểm chi tiết từng phần để cả lớp hiểu rõ tiêu chí và cảm thấy công bằng, thuyết phục hơn ạ.",
      display_sender: "Student puppy",
      display_target: "Cô Trần Thị B",
      target_teacher_id: "22222222-2222-2222-2222-222222222222",
      status: "published",
      created_at: "2026-09-07T07:45:00.000Z",
      updated_at: "2026-09-07T07:45:00.000Z",
    },
    {
      id: "post-104",
      processed_text: "Các dạng bài trong đề kiểm tra 1 tiết có độ khó nâng cao vượt bậc so với những gì cô hướng dẫn trên lớp, và hầu như chỉ những bạn đi học thêm tại lớp riêng của cô mới từng được tiếp cận các dạng đề này trước. Em rất hy vọng cô có thể mở rộng hướng dẫn các phương pháp giải nâng cao ngay trong tiết học chính khóa để tất cả học sinh đều có cơ hội học tập công bằng.",
      display_sender: "Student chirpy",
      display_target: "Cô Phạm Thị D",
      target_teacher_id: "44444444-4444-4444-4444-444444444444",
      status: "published",
      created_at: "2026-09-06T14:20:00.000Z",
      updated_at: "2026-09-06T14:20:00.000Z",
    },
    {
      id: "post-105",
      processed_text: "Khu vực nhà vệ sinh học sinh tại tầng 3 dãy nhà B hiện tại thường xuyên bị thiếu nước xả, bốc mùi khó chịu và không có xà phòng rửa tay, gây ảnh hưởng rất lớn đến sinh hoạt và sức khỏe của học sinh. Chúng em rất mong ban giám hiệu nhà trường sớm kiểm tra và có kế hoạch cải tạo lại để môi trường học tập được đảm bảo vệ sinh hơn.",
      display_sender: "Student otter",
      display_target: "Nhà trường & Ban Giám Hiệu",
      target_teacher_id: null,
      status: "published",
      created_at: "2026-09-06T10:00:00.000Z",
      updated_at: "2026-09-06T10:00:00.000Z",
    },
  ] as PostPublic[],
};
