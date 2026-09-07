"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { mockDatabase } from "@/lib/db";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { PostPublic, UserRole } from "@/types";

gsap.registerPlugin(useGSAP);

const roles: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "student", label: "Học sinh", description: "Meo meo, chia sẻ điều bạn đang trải qua." },
  { value: "teacher", label: "Giáo viên", description: "Gâu gâu, góp ý để lớp học tốt hơn." },
  { value: "school", label: "Nhà trường", description: "Đại diện trường, lắng nghe cộng đồng." },
];

export default function SubmitPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [targetType, setTargetType] = useState<"teacher" | "school">("teacher");
  const [targetTeacherId, setTargetTeacherId] = useState(mockDatabase.teachers[0]?.id || "");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [publishedPost, setPublishedPost] = useState<PostPublic | null>(null);
  const [hasKept, setHasKept] = useState(false);
  const [hasDeleted, setHasDeleted] = useState(false);

  const charCount = text.length;
  const isLengthValid = charCount >= 10 && charCount <= 1500;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (!publishedPost) {
        gsap.from(".form-section", {
          y: 12,
          opacity: 0,
          duration: 0.38,
          stagger: 0.06,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [publishedPost] }
  );

  useGSAP(
    () => {
      if (!publishedPost || !resultCardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(resultCardRef.current, {
        y: 12,
        scale: 0.98,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
      });
    },
    { dependencies: [publishedPost] }
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isLengthValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const selectedTeacher = mockDatabase.teachers.find((teacher) => teacher.id === targetTeacherId);
      const targetLabel = targetType === "teacher" && selectedTeacher
        ? selectedTeacher.display_name
        : "Nhà trường & Ban Giám Hiệu";

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          target: targetLabel,
          target_teacher_id: targetType === "teacher" ? targetTeacherId : undefined,
          text: text.trim(),
          turnstile_token:
            process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
              ? "dev-dummy-token"
              : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Không thể xử lý phản hồi.");
      } else {
        setPublishedPost(data.post);
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePublishedPost() {
    if (!publishedPost) return;
    setErrorMessage("");

    try {
      const response = await fetch(`/api/posts/${publishedPost.id}`, { method: "DELETE" });
      if (response.ok) {
        setHasDeleted(true);
      } else {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error || "Không thể gỡ bài viết.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  }

  function resetForm() {
    setPublishedPost(null);
    setHasDeleted(false);
    setHasKept(false);
    setText("");
    setErrorMessage("");
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="md" showText={false} />
        <p className="eyebrow mt-5 text-amber-700">Một góc nhỏ để nói thật</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Gửi phản hồi ẩn danh</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
          AI sẽ đọc, làm dịu câu chữ và đăng thẳng phiên bản chuẩn mực lên bảng tin. Không có bước xem trước.
        </p>
      </div>

      {publishedPost ? (
        <div ref={resultCardRef} className="surface-card rounded-[2rem] p-5 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Đã đăng lên bảng tin
              </p>
              <p className="mt-1 text-xs text-stone-400">Mã bài viết: {publishedPost.id}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 text-xs font-semibold text-stone-600">
              <span>Người gửi: <strong className="text-amber-700">{publishedPost.display_sender}</strong></span>
              <span className="hidden text-stone-300 sm:inline">→</span>
              <span>Gửi tới: <strong className="text-stone-900">{publishedPost.display_target}</strong></span>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Phiên bản AI đã làm dịu
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-800">{publishedPost.processed_text}</p>
            </div>
          </div>

          {hasDeleted ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
              Bài viết đã được gỡ khỏi bảng tin công khai.
              <button type="button" onClick={resetForm} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800">
                <RotateCcw className="h-3.5 w-3.5" /> Gửi phản hồi khác
              </button>
            </div>
          ) : hasKept ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
              Bài viết đang hiển thị trên bảng tin công khai.
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">
                  Xem bảng tin <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/my-posts" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  Bài của tôi
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-center text-xs leading-5 text-stone-500">Bài đã đăng ngay. Bạn có thể giữ lại hoặc gỡ bài nếu đổi ý.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setHasKept(true)} className="flex-1 rounded-2xl bg-emerald-700 px-4 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-emerald-800">
                  Giữ bài
                </button>
                <button type="button" onClick={handleDeletePublishedPost} className="flex-1 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-sm font-extrabold text-rose-600 transition-colors hover:bg-rose-50">
                  <Trash2 className="mr-1.5 inline h-4 w-4" /> Gỡ bài
                </button>
              </div>
            </div>
          )}

          {errorMessage && <p className="mt-4 text-center text-sm font-semibold text-rose-600">{errorMessage}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="surface-card rounded-[2rem] p-5 sm:p-8">
          <fieldset className="form-section space-y-3">
            <legend className="text-sm font-extrabold text-stone-900">Bạn là ai trong cộng đồng?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={role === item.value}
                  onClick={() => setRole(item.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    role === item.value
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                  }`}
                >
                  <span className="block text-sm font-extrabold text-stone-900">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-stone-500">{item.description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-section mt-8 space-y-3">
            <legend className="text-sm font-extrabold text-stone-900">Bạn muốn gửi đến đâu?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["teacher", "Một thầy / cô"],
                ["school", "Nhà trường"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={targetType === value}
                  onClick={() => setTargetType(value as "teacher" | "school")}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                    targetType === value
                      ? "border-amber-500 bg-amber-50 text-amber-950"
                      : "border-stone-200 bg-white text-stone-700 hover:border-amber-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {targetType === "teacher" && (
              <div>
                <label htmlFor="target-teacher" className="sr-only">Chọn thầy cô</label>
                <select
                  id="target-teacher"
                  value={targetTeacherId}
                  onChange={(event) => setTargetTeacherId(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
                >
                  {mockDatabase.teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.display_name} · {teacher.subject}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-stone-400">Tên thầy/cô là đích phản hồi nên sẽ hiển thị; danh tính người gửi vẫn được ẩn.</p>
              </div>
            )}
          </fieldset>

          <div className="form-section mt-8 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="feedback-text" className="text-sm font-extrabold text-stone-900">Nội dung phản hồi</label>
              <span aria-live="polite" className={`text-xs font-bold ${charCount > 1500 ? "text-rose-600" : charCount >= 10 ? "text-emerald-600" : "text-stone-400"}`}>
                {charCount.toLocaleString("vi-VN")} / 1.500
              </span>
            </div>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Kể lại trải nghiệm, điều bạn băn khoăn hoặc đề xuất cải thiện..."
              maxLength={1500}
              rows={8}
              required
              className="w-full resize-y rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-7 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
            />
            <p className="text-xs leading-5 text-stone-400">Tối thiểu 10 ký tự. AI chỉ chỉnh giọng văn, không đổi ý chính.</p>
          </div>

          <div className="form-section mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs leading-5 text-emerald-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>Danh tính hiển thị dưới alias dễ thương. Bản gốc, IP hash và log chỉ dành cho backend/admin theo chính sách.</span>
          </div>

          {errorMessage && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isLengthValid || isSubmitting}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-stone-950/15 transition-transform hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? "AI đang làm dịu & đăng bài..." : "Gửi và đăng ngay"}
          </button>
        </form>
      )}
    </div>
  );
}
