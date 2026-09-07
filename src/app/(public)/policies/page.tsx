import { ShieldCheck, Sparkles, AlertCircle, EyeOff, Scale } from "lucide-react";

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Chính sách & Quy chuẩn vận hành
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Nguyên tắc hoạt động, bảo vệ quyền riêng tư và quy trình kiểm duyệt tại Trải Lòng Trần Phú (TLTP).
        </p>
      </div>

      {/* 1. Unofficial site notice */}
      <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          1. Tuyên bố kênh độc lập & không chính thức
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-stone-700">
          TLTP là diễn đàn phản hồi học đường độc lập do cộng đồng thành lập nhằm mục đích lắng nghe, chia sẻ và cùng nhau xây dựng môi trường học tập tích cực.
          <strong> Diễn đàn không phải là trang thông tin điện tử chính thức của trường THPT Trần Phú và không đại diện hay phát ngôn thay cho nhà trường.</strong>
        </p>
      </section>

      {/* 2. Privacy & Identity */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-stone-900">
          <EyeOff className="h-5 w-5 text-amber-600" />
          2. Mô hình ẩn danh & Bảo mật danh tính
        </div>
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-600">
          <p>
            - <strong>Bí danh ngẫu nhiên:</strong> Người gửi được hệ thống gán một bí danh ngẫu nhiên (ví dụ: <code>Student meow meow</code>, <code>Teacher chirp chirp</code>). Bí danh thay đổi theo từng bài viết để tránh bị liên kết chéo.
          </p>
          <p>
            - <strong>Khử định danh tự động (PII Redaction):</strong> Mọi thông tin nhạy cảm như họ tên học sinh khác, số điện thoại, email, địa chỉ, tài khoản mạng xã hội sẽ được tự động lọc và xóa trước khi xuất bản.
          </p>
          <p>
            - <strong>Tách biệt dữ liệu công khai và dữ liệu gốc:</strong> Người dùng công khai chỉ đọc được phiên bản đã qua xử lý AI. Dữ liệu gốc và nhật ký kỹ thuật được bảo vệ nghiêm ngặt trong hệ thống máy chủ phục vụ đối soát và xử lý tranh chấp khi có yêu cầu pháp lý.
          </p>
        </div>
      </section>

      {/* 3. Content & AI rewriting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-stone-900">
          <Sparkles className="h-5 w-5 text-amber-600" />
          3. Cơ chế AI làm dịu ngôn từ & Xuất bản tức thì
        </div>
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-600">
          <p>
            - <strong>Không từ chối vì câu từ gay gắt:</strong> Phản hồi có liên quan đến việc học tập sẽ không bị chặn chỉ vì lời văn bức xúc, nhạy cảm hay dùng từ ngữ thô tục. AI sẽ tự động điều chỉnh lời văn trở nên nhã nhặn, tôn trọng và mang tính xây dựng mà vẫn giữ nguyên trải nghiệm cốt lõi của người gửi.
          </p>
          <p>
            - <strong>Loại bỏ nội dung lạc đề:</strong> Các nội dung spam, quảng cáo, chửi bới vô căn cứ hoặc không liên quan đến môi trường học đường sẽ bị AI nhận diện và không được tạo bài đăng công khai.
          </p>
          <p>
            - <strong>Đăng ngay và quyền Giữ / Xóa (Keep / Delete):</strong> Sau khi AI xử lý, bài viết được xuất bản ngay lập tức. Người gửi có toàn quyền chọn <strong>Giữ bài (Keep)</strong> hoặc <strong>Xóa bài (Delete)</strong> nếu cảm thấy không còn phù hợp.
          </p>
        </div>
      </section>

      {/* 4. Reporting & Moderation */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-stone-900">
          <Scale className="h-5 w-5 text-amber-600" />
          4. Quy trình Báo cáo & Kiểm duyệt sau đăng
        </div>
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-600">
          <p>
            Bất kỳ thành viên nào cũng có thể gửi báo cáo nếu nhận thấy bài viết có dấu hiệu:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Quấy rối hoặc xúc phạm danh dự nghiêm trọng.</li>
            <li>Lộ thông tin đời tư cá nhân.</li>
            <li>Đe dọa an toàn hoặc bạo lực học đường.</li>
            <li>Thông tin sai sự thật gây ảnh hưởng tiêu cực.</li>
          </ul>
          <p>
            Đội ngũ quản trị viên có quyền tạm ẩn, gỡ bỏ vĩnh viễn hoặc ghi chú làm rõ đối với các bài viết bị báo cáo.
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center text-xs text-stone-500">
        Mọi đóng góp về chính sách xin vui lòng liên hệ ban quản trị diễn đàn TLTP.
      </div>
    </div>
  );
}
