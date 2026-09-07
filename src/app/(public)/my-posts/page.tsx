"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Trash2, CheckCircle2 } from "lucide-react";
import { mockDatabase } from "@/lib/db";
import { getCurrentDevUser } from "@/features/auth";
import type { PostPublic } from "@/types";

export default function MyPostsPage() {
  const user = getCurrentDevUser();
  const [posts, setPosts] = useState<PostPublic[]>(
    mockDatabase.posts.filter((p) => p.author_id === user.id || p.id === "post-101")
  );

  async function handleDelete(postId: string) {
    if (!confirm("Bạn có chắc chắn muốn gỡ bài viết này?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status: "deleted" } : p))
        );
      } else {
        alert("Không thể gỡ bài viết");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Bài viết của tôi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi trạng thái và thực hiện quyền <strong>Giữ bài (Keep)</strong> hoặc <strong>Xóa bài (Delete)</strong>.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors self-start"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Gửi bài mới
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center space-y-3">
          <p className="text-sm text-stone-500">Bạn chưa gửi phản hồi nào.</p>
          <Link
            href="/submit"
            className="inline-block rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Chia sẻ trải nghiệm đầu tiên
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isDeleted = post.status === "deleted";
            const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "numeric",
            });

            return (
              <div
                key={post.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isDeleted
                    ? "border-stone-200 bg-stone-50 opacity-60"
                    : "border-stone-200 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800">
                      Gửi đến: {post.display_target}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-400">Ẩn danh: {post.display_sender}</span>
                  </div>

                  <div>
                    {isDeleted ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        Đã xóa (Deleted)
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Đang hiển thị
                      </span>
                    )}
                  </div>
                </div>

                <p className="py-3 text-xs sm:text-sm text-stone-800 leading-relaxed">
                  {post.processed_text}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                  <span suppressHydrationWarning>Ngày gửi: {formattedDate}</span>

                  {!isDeleted && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa bài này (Delete)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
