"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { STUDENT_TARGET_LABEL } from "@/types";
import type { PostPublic, UserRole } from "@/types";

gsap.registerPlugin(useGSAP);

const roles: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "student", label: "Học sinh", description: "Meo meo, chia sẻ điều bạn đang trải qua." },
  { value: "teacher", label: "Giáo viên", description: "Gâu gâu, góp ý để lớp học tốt hơn." },
  { value: "school", label: "Nhà trường", description: "Đại diện trường, lắng nghe cộng đồng." },
];

export default function SubmitPage() {
  const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [isRoleLoading, setIsRoleLoading] = useState(!demoEnabled);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [publishedPost, setPublishedPost] = useState<PostPublic | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const charCount = text.length;
  const isLengthValid = charCount >= 10 && charCount <= 1500;
  const canSubmit = isLengthValid && (demoEnabled || Boolean(turnstileToken));

  useEffect(() => {
    if (demoEnabled) return;

    setIsRoleLoading(true);
    fetch("/api/submissions", { cache: "no-store" })
      .then(async (quotaResponse) => {
        if (!quotaResponse.ok) throw new Error("form_config_load_failed");

        const quotaData = await quotaResponse.json();

        if (quotaData?.role === "student" || quotaData?.role === "teacher" || quotaData?.role === "school") {
          setRole(quotaData.role);
        }

      })
      .catch(() => setErrorMessage("Không thể tải cấu hình phản hồi. Vui lòng tải lại trang."))
      .finally(() => setIsRoleLoading(false));
  }, [demoEnabled]);

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
    if (!canSubmit || isSubmitting || isRoleLoading) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          text: text.trim(),
          turnstile_token:
            demoEnabled ? "dev-dummy-token" : turnstileToken || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setTurnstileToken("");
        setTurnstileResetKey((key) => key + 1);
        setErrorMessage(data.error || "Không thể xử lý phản hồi.");
      } else {
        setPublishedPost(data.post);
      }
    } catch {
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setPublishedPost(null);
    setText("");
    setErrorMessage("");
    setTurnstileToken("");
    setTurnstileResetKey((key) => key + 1);
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

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
            Bài viết đã được đăng ngay. Nếu muốn xóa, mở mục <strong>Bài của tôi</strong>.
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">
                Xem bảng tin <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/my-posts" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                Bài của tôi
              </Link>
              <button type="button" onClick={resetForm} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                Gửi bài khác
              </button>
            </div>
          </div>

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
                  disabled={!demoEnabled}
                  aria-pressed={role === item.value}
                  onClick={() => setRole(item.value)}
                  className={`rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed ${
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
            <legend className="text-sm font-extrabold text-stone-900">AI tự nhận diện người nhận</legend>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              {role === "student" ? (
                <>
                  <p className="text-sm font-extrabold text-amber-950">Không cần chọn thầy/cô</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/75">Hãy nhắc tên thầy/cô trong nội dung. AI sẽ đối chiếu danh sách giáo viên đang hoạt động và tự gửi đúng người; danh tính người gửi vẫn được ẩn.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-extrabold text-amber-950">{STUDENT_TARGET_LABEL}</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/75">Phản hồi của giáo viên/nhà trường được gửi tới học sinh hoặc lớp học; hệ thống giữ kín danh tính học sinh.</p>
                </>
              )}
            </div>
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

          {!demoEnabled && (
            <div className="form-section mt-5 rounded-2xl border border-stone-200 bg-white p-4">
              <p className="mb-3 text-xs font-bold text-stone-700">Xác thực chống bot</p>
              <TurnstileWidget
                resetSignal={turnstileResetKey}
                onToken={(token) => {
                  setTurnstileToken(token);
                  setErrorMessage("");
                }}
                onError={setErrorMessage}
              />
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting || isRoleLoading}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-stone-950/15 transition-transform hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isRoleLoading ? "Đang tải vai trò..." : isSubmitting ? "AI đang làm dịu & đăng bài..." : "Gửi và đăng ngay"}
          </button>
        </form>
      )}
    </div>
  );
}
