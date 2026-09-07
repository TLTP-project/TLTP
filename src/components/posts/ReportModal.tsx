"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ReportModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Quấy rối hoặc xúc phạm nghiêm trọng" },
  { value: "pii_leak", label: "Tiết lộ thông tin định danh cá nhân" },
  { value: "safety_threat", label: "Đe dọa an toàn hoặc có yếu tố bạo lực" },
  { value: "misinformation", label: "Thông tin sai lệch gây ảnh hưởng xấu" },
  { value: "other", label: "Lý do khác" },
];

export function ReportModal({ postId, isOpen, onClose }: ReportModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setReason("harassment");
    setDetails("");
    setIsSubmitted(false);
    setErrorMessage("");
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reason, details }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Không thể gửi báo cáo");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMessage("Lỗi kết nối đến máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-black text-stone-900">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Báo cáo phản hồi
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại báo cáo"
            className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="space-y-3 py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="text-sm font-bold text-stone-800">Báo cáo đã được ghi nhận.</p>
            <p className="text-sm leading-6 text-stone-500">
              Ban quản trị sẽ xem xét nội dung này. Cảm ơn bạn đã giúp giữ diễn đàn an toàn.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-stone-800">Lý do báo cáo</legend>
              <div className="space-y-2">
                {REPORT_REASONS.map((item) => (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                      reason === item.value
                        ? "border-amber-500 bg-amber-50 font-semibold text-amber-950"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={(event) => setReason(event.target.value)}
                      className="h-4 w-4 accent-amber-600"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="report-details" className="text-sm font-bold text-stone-800">
                Mô tả thêm <span className="font-normal text-stone-400">(không bắt buộc)</span>
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Cung cấp thêm chi tiết nếu cần..."
                maxLength={500}
                rows={4}
                className="w-full resize-y rounded-2xl border border-stone-200 p-3 text-sm leading-6 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
              />
              <p className="text-right text-xs text-stone-400">{details.length}/500</p>
            </div>

            {errorMessage && <p className="text-sm font-semibold text-rose-600">{errorMessage}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
