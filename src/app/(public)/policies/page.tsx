import { AlertCircle, EyeOff, Scale, Sparkles } from "lucide-react";

const sections = [
  {
    icon: EyeOff,
    title: "Ẩn danh & bảo mật danh tính",
    body: (
      <>
        <p><strong>Bí danh theo từng bài:</strong> Hệ thống tự gán alias dễ thương như <code>Student meow meow</code> hoặc <code>Teacher chirp chirp</code>; người gửi không tự chọn alias.</p>
        <p><strong>Khử PII trước khi đăng:</strong> Tên học sinh khác, số điện thoại, email, địa chỉ, tài khoản mạng xã hội và mã học sinh được che tự động.</p>
        <p><strong>Tách dữ liệu:</strong> Bảng tin chỉ có văn bản AI đã xử lý. Bản gốc, identity, IP hash và audit log nằm trong vùng backend bị giới hạn.</p>
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "AI làm dịu & đăng ngay",
    body: (
      <>
        <p><strong>Không chặn vì lời lẽ:</strong> Feedback liên quan đến trường học dù bức xúc hay dùng từ thô vẫn được AI chuyển thành lời lịch sự, xây dựng và giữ nguyên ý chính.</p>
        <p><strong>Lọc nội dung lạc đề:</strong> Spam, quảng cáo hoặc nội dung không liên quan nhận quyết định <code>nothing</code> và không tạo bài công khai.</p>
        <p><strong>Không có preview:</strong> AI xử lý xong là bài được đăng. Người gửi chỉ chọn giữ bài hoặc gỡ bài sau đó.</p>
      </>
    ),
  },
  {
    icon: Scale,
    title: "Báo cáo & kiểm duyệt sau đăng",
    body: (
      <>
        <p>Bạn có thể báo cáo bài có dấu hiệu:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Quấy rối, xúc phạm nghiêm trọng hoặc đe dọa an toàn.</li>
          <li>Tiết lộ đời tư, thông tin định danh hoặc nội dung bạo lực.</li>
          <li>Thông tin sai lệch gây ảnh hưởng tiêu cực.</li>
        </ul>
        <p>Quản trị viên có thể tạm ẩn, gỡ bài, khôi phục hoặc ghi chú xử lý. Report thật luôn gửi trong website, không đưa lên GitHub Issues.</p>
      </>
    ),
  },
];

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow text-amber-700">Minh bạch để an tâm</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Chính sách & quy chuẩn</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500 sm:text-base">Cách TLTP bảo vệ danh tính, làm dịu ngôn từ và xử lý báo cáo trong cộng đồng trường học.</p>
      </header>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-base font-black text-amber-950">TLTP là kênh độc lập</h2>
            <p className="mt-2 text-sm leading-7 text-stone-700">TLTP do cộng đồng xây dựng để lắng nghe, chia sẻ và cải thiện môi trường học tập. <strong>Đây không phải website chính thức của trường THPT Trần Phú và không đại diện hay phát ngôn thay cho nhà trường.</strong></p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="surface-card rounded-3xl p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-stone-400">0{index + 1}</p>
                  <h2 className="mt-1 text-lg font-black text-stone-900">{section.title}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">{section.body}</div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-4 text-center text-sm leading-6 text-stone-500">Mọi góp ý về chính sách xin gửi qua kênh quản trị của diễn đàn TLTP.</div>
    </div>
  );
}
