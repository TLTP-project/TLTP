"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpenCheck, School as SchoolIcon, CheckCircle2, AlertCircle } from "lucide-react";
import type { UserRole } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRole, setSubmittedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: "student" as UserRole,
      title: "Học sinh (Student)",
      icon: GraduationCap,
      desc: "Tham gia diễn đàn, gửi phản hồi ẩn danh và theo dõi bài viết ngay lập tức.",
      statusBadge: "Sử dụng được ngay",
      statusClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "teacher" as UserRole,
      title: "Giáo viên (Teacher)",
      icon: BookOpenCheck,
      desc: "Lắng nghe phản hồi từ học sinh và chia sẻ góc nhìn sư phạm với nhà trường.",
      statusBadge: "Cần xác thực quản trị",
      statusClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "school" as UserRole,
      title: "Nhà trường (School)",
      icon: SchoolIcon,
      desc: "Đại diện ban giám hiệu, quản trị viên lắng nghe và cải thiện môi trường sư phạm.",
      statusBadge: "Cần xác thực quản trị",
      statusClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  async function handleConfirmRole() {
    setIsSubmitting(true);
    // In production, call /api/onboarding or Supabase profile update
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRole(selectedRole);
    }, 600);
  }

  if (submittedRole) {
    const isStudent = submittedRole === "student";

    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-5">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold text-stone-900">
          {isStudent ? "Thiết lập tài khoản thành công!" : "Đã tiếp nhận yêu cầu xác thực!"}
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {isStudent
            ? "Vai trò Học sinh của bạn đã được kích hoạt. Bạn có thể bắt đầu chia sẻ phản hồi ngay bây giờ."
            : "Tài khoản Giáo viên / Nhà trường của bạn đang ở trạng thái Chờ xác thực (pending_verification). Ban quản trị sẽ rà soát thông tin trước khi cấp quyền đặc biệt."}
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full rounded-2xl bg-amber-600 py-3 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-amber-700"
        >
          Khám phá Bảng tin ngay
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Chọn vai trò của bạn
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Vui lòng chọn vai trò phù hợp nhất với bạn trong cộng đồng trường học.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;

          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-amber-600 bg-amber-50/50 shadow-sm"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-2xl p-2.5 ${
                    isSelected
                      ? "bg-amber-600 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-900">{r.title}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.statusClass}`}
                    >
                      {r.statusBadge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 p-3.5 text-xs text-amber-900 border border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span>
          Theo quy chuẩn tại `PLAN.md`, người dùng không thể tự cấp vai trò cao hơn. Vai trò Giáo viên & Nhà trường cần được admin phê duyệt.
        </span>
      </div>

      <button
        onClick={handleConfirmRole}
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-amber-600 py-3.5 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-amber-700 shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? "Đang lưu..." : "Xác nhận vai trò"}
      </button>
    </div>
  );
}
