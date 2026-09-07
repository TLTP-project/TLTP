"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Send,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { mockDatabase } from "@/lib/db";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { UserRole, PostPublic } from "@/types";

gsap.registerPlugin(useGSAP);

export default function SubmitPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<UserRole>("student");
  const [targetType, setTargetType] = useState<"teacher" | "school">("teacher");
  const [targetTeacherId, setTargetTeacherId] = useState<string>(
    mockDatabase.teachers[0]?.id || ""
  );
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Result state after submission (Published immediately with Keep / Delete)
  const [publishedPost, setPublishedPost] = useState<PostPublic | null>(null);
  const [hasKept, setHasKept] = useState(false);
  const [hasDeleted, setHasDeleted] = useState(false);

  const charCount = text.length;
  const isLengthValid = charCount >= 10 && charCount <= 1500;

  useGSAP(
    () => {
      if (!publishedPost) {
        gsap.from(".form-section", {
          y: 20,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [publishedPost] }
  );

  useGSAP(
    () => {
      if (publishedPost && resultCardRef.current) {
        gsap.from(resultCardRef.current, {
          scale: 0.94,
          autoAlpha: 0,
          duration: 0.6,
          ease: "back.out(1.5)",
        });
      }
    },
    { dependencies: [publishedPost] }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLengthValid) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const selectedTeacher = mockDatabase.teachers.find(
        (t) => t.id === targetTeacherId
      );
      const targetLabel =
        targetType === "teacher" && selectedTeacher
          ? selectedTeacher.display_name
          : "Nhà trường & Cộng đồng";

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          target: targetLabel,
          target_teacher_id: targetType === "teacher" ? targetTeacherId : undefined,
          text,
          // The local demo bypass is intentionally never sent from production builds.
          turnstile_token:
            process.env.NODE_ENV !== "production" ||
            process.env.NEXT_PUBLIC_DEMO_MODE === "true"
              ? "dev-dummy-token"
              : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Không thể xử lý phản hồi");
      } else {
        setPublishedPost(data.post);
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePublishedPost() {
    if (!publishedPost) return;
    try {
      const res = await fetch(`/api/posts/${publishedPost.id}`, { method: "DELETE" });
      if (res.ok) {
        setHasDeleted(true);
      } else {
        alert("Lỗi khi xóa bài viết.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    }
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-3 text-center flex flex-col items-center">
        <Logo size="md" showText={false} />
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
          Gửi phản hồi ẩn danh
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Mọi thông điệp đều được AI tự động làm dịu, loại bỏ yếu tố công kích cá nhân và xuất bản ngay lập tức.
        </p>
      </div>

      {/* CASE 1: Successfully published -> Show AI text & Keep / Delete */}
      {publishedPost ? (
        <div
          ref={resultCardRef}
          className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-md space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đã xuất bản (Status: Published)
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                Mã bài viết: {publishedPost.id}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span>Người gửi: <strong className="text-amber-700">{publishedPost.display_sender}</strong></span>
              <span>Gửi đến: <strong className="text-stone-800">{publishedPost.display_target}</strong></span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2.5">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Văn bản đã được AI làm dịu & xuất bản công khai:
              </div>
              <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap font-normal">
                {publishedPost.processed_text}
              </p>
            </div>
          </div>

          {hasDeleted ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-medium text-rose-700">
              Bạn đã chọn <strong>Xóa (Delete)</strong>. Bài viết đã được gỡ khỏi trang công khai.
              <div className="mt-3">
                <button
                  onClick={() => {
                    setPublishedPost(null);
                    setHasDeleted(false);
                    setHasKept(false);
                    setText("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Gửi phản hồi khác
                </button>
              </div>
            </div>
          ) : hasKept ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs font-medium text-emerald-800">
              Bạn đã chọn <strong>Giữ bài (Keep)</strong>. Bài viết của bạn đang hiển thị trên bảng tin công khai.
              <div className="mt-3 flex justify-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Xem trên Bảng tin <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/my-posts"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Quản lý bài của tôi
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-stone-500 text-center">
                Theo quy định, bài viết được đăng ngay. Bạn có thể chọn <strong>Giữ bài (Keep)</strong> để chia sẻ tiếp hoặc <strong>Xóa bài (Delete)</strong> nếu đổi ý:
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setHasKept(true)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
                >
                  Giữ bài (Keep)
                </button>
                <button
                  onClick={handleDeletePublishedPost}
                  className="flex-1 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="inline h-4 w-4 mr-1" />
                  Xóa bài (Delete)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CASE 2: Form Input */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Step 1: Role Selection */}
          <div className="form-section space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              1. Vai trò của bạn:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "student", label: "Học sinh" },
                { value: "teacher", label: "Giáo viên" },
                { value: "school", label: "Nhà trường" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setRole(item.value as UserRole)}
                  className={`rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                    role === item.value
                      ? "border-amber-600 bg-amber-50 text-amber-950 shadow-xs"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Target Selection */}
          <div className="form-section space-y-3">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              2. Đối tượng nhận phản hồi:
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("teacher")}
                className={`rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                  targetType === "teacher"
                    ? "border-amber-600 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                Gửi tới Thầy / Cô
              </button>
              <button
                type="button"
                onClick={() => setTargetType("school")}
                className={`rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                  targetType === "school"
                    ? "border-amber-600 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                Gửi tới Nhà trường
              </button>
            </div>

            {targetType === "teacher" && (
              <div className="pt-1">
                <select
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs sm:text-sm text-stone-800 font-medium focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                >
                  {mockDatabase.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.display_name} — Môn {t.subject}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-stone-400">
                  * Tên thầy/cô được mã hóa nội bộ thành [[TARGET_TEACHER]] và khôi phục sau khi AI làm dịu văn bản.
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Feedback Content */}
          <div className="form-section space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                3. Nội dung phản hồi:
              </label>
              <span
                className={`text-xs font-semibold ${
                  charCount > 1500
                    ? "text-rose-600 font-bold"
                    : charCount < 10
                    ? "text-stone-400"
                    : "text-amber-700"
                }`}
              >
                {charCount} / 1,500 ký tự (tối thiểu 10)
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Chia sẻ trải nghiệm, thắc mắc hoặc đề xuất cải thiện của bạn... Cứ viết thoải mái, AI sẽ tự động điều chỉnh lời văn lịch sự và mang tính xây dựng trước khi xuất bản."
              rows={6}
              className="w-full rounded-2xl border border-stone-200 p-4 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed transition-all"
            />
          </div>

          {/* Bot Protection & Security Banner */}
          <div className="form-section flex items-center gap-2 rounded-2xl bg-stone-50 p-3.5 text-xs text-stone-500 border border-stone-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>
              Bảo vệ bởi Cloudflare Turnstile & Quota: Tối đa 1 bài đăng/ngày và 3 lượt xử lý AI/ngày.
            </span>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isLengthValid || isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 py-4 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:from-amber-700 hover:to-orange-700 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 transform active:scale-99"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                AI đang làm dịu văn bản & xuất bản...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Gửi phản hồi ngay
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
