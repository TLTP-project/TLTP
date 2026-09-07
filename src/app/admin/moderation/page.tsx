"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, EyeOff, Trash2, RotateCcw } from "lucide-react";
import { mockDatabase } from "@/lib/db";
import { moderatePost } from "@/features/moderation";
import type { PostPublic } from "@/types";

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<PostPublic[]>(mockDatabase.posts);

  async function handleAction(postId: string, action: "hide" | "restore" | "delete") {
    await moderatePost({
      adminId: "admin-system",
      postId,
      action,
    });
    setPosts([...mockDatabase.posts]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 mb-1 border border-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            Trang quản trị viên (Admin)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Quản lý và kiểm duyệt bài viết
          </h1>
        </div>

        <Link
          href="/admin/reports"
          className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
        >
          Xử lý báo cáo ({mockDatabase.posts.length})
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800">Mã: {post.id}</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">Từ: {post.display_sender}</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">Tới: {post.display_target}</span>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  post.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : post.status === "hidden"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                Trạng thái: {post.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
              {post.processed_text}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              {post.status !== "published" && (
                <button
                  onClick={() => handleAction(post.id, "restore")}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Khôi phục hiển thị
                </button>
              )}

              {post.status === "published" && (
                <button
                  onClick={() => handleAction(post.id, "hide")}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <EyeOff className="h-3.5 w-3.5" /> Tạm ẩn bài viết
                </button>
              )}

              {post.status !== "deleted" && (
                <button
                  onClick={() => handleAction(post.id, "delete")}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa vĩnh viễn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
