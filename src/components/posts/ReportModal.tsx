"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ReportModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Quấy rối hoặc xúc phạm nghiêm trọng" },
  { value: "pii_leak", label: "Tiết lộ thông tin định danh cá nhân (PII)" },
  { value: "safety_threat", label: "Đe dọa an toàn hoặc có yếu tố bạo lực" },
  { value: "misinformation", label: "Thông tin sai sự thật gây ảnh hưởng xấu" },
  { value: "other", label: "Lý do khác" },
];

export function ReportModal({ postId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          reason,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Báo cáo phản hồi này
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="text-sm font-medium text-stone-800">
              Báo cáo của bạn đã được ghi nhận.
            </p>
            <p className="text-xs text-stone-500">
              Ban quản trị sẽ rà soát nội dung này trong thời gian sớm nhất.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">
                Lý do báo cáo:
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                      reason === r.value
                        ? "border-amber-600 bg-amber-50/50 text-amber-950 font-semibold"
                        : "border-stone-200 hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Mô tả thêm (không bắt buộc):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Cung cấp thêm chi tiết nếu cần..."
                rows={3}
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
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
