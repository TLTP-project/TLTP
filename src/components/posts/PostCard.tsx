"use client";

import { useState } from "react";
import { Flag, Trash2, Sparkles, MessageCircle } from "lucide-react";
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

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này? Bài viết sẽ được ẩn khỏi trang công khai.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsDeleted(true);
        onDeleted?.(post.id);
      } else {
        alert("Không thể xóa bài viết. Vui lòng thử lại.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isDeleted) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100/60 p-4 text-center text-xs text-stone-500 italic">
        Bài viết này đã được gỡ bỏ bởi người gửi.
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "numeric",
  });

  return (
    <article className="rounded-2xl border border-amber-900/10 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Sender & Target Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-stone-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sender alias */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {post.display_sender}
          </span>

          <span className="text-xs text-stone-400">gửi tới</span>

          {/* Target */}
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-800">
            <MessageCircle className="h-3 w-3 text-stone-500" />
            {post.display_target}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span suppressHydrationWarning className="text-[11px] text-stone-400">{formattedDate}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md">
            <Sparkles className="h-3 w-3" /> AI đã tinh chỉnh
          </span>
        </div>
      </div>

      {/* Main Content: Rewritten Constructive Text */}
      <div className="py-4">
        <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap font-normal">
          {post.processed_text}
        </p>
      </div>

      {/* Footer: Disclaimer & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
        <p className="text-[11px] text-stone-400 italic">
          * Trải nghiệm chia sẻ từ thành viên, không phải kết luận chính thức.
        </p>

        <div className="flex items-center gap-2">
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? "Đang xóa..." : "Xóa bài (Delete)"}
            </button>
          )}

          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <Flag className="h-3.5 w-3.5" />
            Báo cáo
          </button>
        </div>
      </div>

      <ReportModal
        postId={post.id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </article>
  );
}
