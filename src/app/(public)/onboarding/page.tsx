"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookOpenCheck, CheckCircle2, GraduationCap, School as SchoolIcon } from "lucide-react";
import type { UserRole } from "@/types";

const roles: Array<{
  id: UserRole;
  title: string;
  icon: typeof GraduationCap;
  description: string;
  status: string;
}> = [
  { id: "student", title: "Học sinh", icon: GraduationCap, description: "Gửi phản hồi ẩn danh và theo dõi bài viết ngay.", status: "Kích hoạt ngay" },
  { id: "teacher", title: "Giáo viên", icon: BookOpenCheck, description: "Lắng nghe học sinh và chia sẻ góc nhìn sư phạm.", status: "Cần xác thực" },
  { id: "school", title: "Nhà trường", icon: SchoolIcon, description: "Đại diện trường cùng cải thiện môi trường học tập.", status: "Cần xác thực" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRole, setSubmittedRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirmRole() {
    setIsSubmitting(true);
    setErrorMessage("");

    const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (demoEnabled) {
      window.setTimeout(() => {
        setIsSubmitting(false);
        setSubmittedRole(selectedRole);
      }, 450);
      return;
    }

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Không thể lưu vai trò.");
      } else {
        setSubmittedRole(selectedRole);
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedRole) {
    const needsReview = submittedRole !== "student";

    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-7 w-7" /></div>
        <p className="eyebrow mt-6 text-emerald-700">Thiết lập hoàn tất</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">{needsReview ? "Đã gửi yêu cầu xác thực" : "Bạn đã sẵn sàng"}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          {needsReview ? "Vai trò Giáo viên / Nhà trường sẽ được quản trị viên xác thực trước khi cấp quyền đặc biệt." : "Vai trò Học sinh đã được kích hoạt. Bạn có thể bắt đầu chia sẻ ngay."}
        </p>
        <button type="button" onClick={() => router.push("/")} className="mt-7 w-full rounded-2xl bg-stone-950 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-stone-800">Khám phá bảng tin</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="text-center">
        <p className="eyebrow text-amber-700">Bước cuối cùng</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Chọn vai trò của bạn</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Vai trò giúp TLTP áp dụng đúng quyền riêng tư và cách hiển thị.</p>
      </div>

      <div className="mt-8 space-y-3">
        {roles.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedRole(item.id)}
              className={`flex w-full items-start gap-4 rounded-3xl border p-5 text-left transition-all ${
                isSelected ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-900/5" : "surface-card hover:border-amber-300"
              }`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isSelected ? "bg-stone-950 text-amber-300" : "bg-stone-100 text-stone-600"}`}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-stone-900">{item.title}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isSelected ? "bg-white text-amber-800" : "bg-stone-100 text-stone-500"}`}>{item.status}</span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-stone-500">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <span>Học sinh dùng được ngay. Giáo viên và Nhà trường cần admin xác thực; không ai tự nâng quyền cho mình.</span>
      </div>

      {errorMessage && <p role="alert" className="mt-4 text-sm font-semibold text-rose-600">{errorMessage}</p>}

      <button type="button" onClick={handleConfirmRole} disabled={isSubmitting} className="mt-6 h-14 w-full rounded-2xl bg-stone-950 px-4 text-sm font-extrabold text-white shadow-lg shadow-stone-950/10 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting ? "Đang lưu lựa chọn..." : "Xác nhận vai trò"}
      </button>
    </div>
  );
}
