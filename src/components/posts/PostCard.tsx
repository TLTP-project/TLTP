"use client";

import { useState } from "react";
import { Flag, MessageCircle, Sparkles, Trash2 } from "lucide-react";
import { ReportModal } from "./ReportModal";
import type { PostPublic } from "@/types";

interface PostCardProps {
  post: PostPublic;
  isAuthor?: boolean;
  onDeleted?: (postId: string) => void;
}

export function PostCard({ post, isAuthor = false, onDeleted }: PostCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(post.status === "deleted");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ bài viết này khỏi bảng tin?")) return;

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error || "Không thể xóa bài viết. Vui lòng thử lại.");
        return;
      }

      setIsDeleted(true);
      onDeleted?.(post.id);
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isDeleted) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100/70 p-5 text-center text-sm text-stone-500">
        <p className="font-semibold">Bài viết này đã được gỡ khỏi bảng tin.</p>
        <p className="mt-1 text-xs">Nội dung riêng tư vẫn được lưu theo chính sách của TLTP.</p>
      </div>
    );
  }

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(post.created_at));

  return (
    <article className="surface-card rounded-3xl p-5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-6">
      <header className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-950">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {post.display_sender}
          </span>
          <span className="text-xs font-medium text-stone-400">gửi tới</span>
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-800">
            <MessageCircle className="h-3.5 w-3.5 shrink-0 text-stone-500" />
            <span className="truncate">{post.display_target}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400 sm:shrink-0">
          <time dateTime={post.created_at}>{formattedDate}</time>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
            <Sparkles className="h-3 w-3" />
            AI đã tinh chỉnh
          </span>
        </div>
      </header>

      <p className="py-5 text-[0.95rem] leading-7 text-stone-800 whitespace-pre-wrap">
        {post.processed_text}
      </p>

      <footer className="flex flex-col gap-3 border-t border-stone-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-stone-400">
          Trải nghiệm do thành viên chia sẻ, không phải kết luận chính thức.
        </p>

        <div className="flex items-center gap-2 sm:shrink-0">
          {isAuthor && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? "Đang gỡ..." : "Gỡ bài"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            aria-label={`Báo cáo phản hồi ${post.display_target}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
          >
            <Flag className="h-3.5 w-3.5" />
            Báo cáo
          </button>
        </div>
      </footer>

      {errorMessage && <p className="mt-3 text-right text-xs font-medium text-rose-600">{errorMessage}</p>}

      <ReportModal
        postId={post.id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </article>
  );
}
