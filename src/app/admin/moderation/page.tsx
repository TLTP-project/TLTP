"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, EyeOff, Trash2, RotateCcw } from "lucide-react";
import { mockDatabase } from "@/lib/db";
import { moderatePost } from "@/features/moderation";
import type { PostPublic } from "@/types";

export default function AdminModerationPage() {
  const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [posts, setPosts] = useState<PostPublic[]>(demoEnabled ? mockDatabase.posts : []);
  const [isLoading, setIsLoading] = useState(!demoEnabled);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (demoEnabled) return;

    fetch("/api/posts?scope=moderation", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Không thể tải nội dung kiểm duyệt.");
        setPosts(data.posts ?? []);
      })
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [demoEnabled]);

  async function handleAction(postId: string, action: "hide" | "restore" | "delete") {
    if (action === "delete" && !window.confirm("Xóa bài viết này khỏi bảng tin?")) return;

    setIsProcessing(true);
    setErrorMessage("");
    try {
      if (demoEnabled) {
        await moderatePost({
          adminId: "admin-system",
          postId,
          action,
        });
        setPosts([...mockDatabase.posts]);
      } else {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Không thể cập nhật bài viết.");
        setPosts((current) => current.map((post) => (
          post.id === postId
            ? { ...post, status: data.status, deleted_at: data.status === "deleted" ? new Date().toISOString() : null }
            : post
        )));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật bài viết.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
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
          Xử lý báo cáo{demoEnabled ? ` (${mockDatabase.posts.length})` : ""}
        </Link>
      </div>

      {errorMessage && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{errorMessage}</p>}

      <div className="space-y-4">
        {isLoading ? (
          <div className="surface-card rounded-3xl p-10 text-center text-sm text-stone-500">Đang tải nội dung kiểm duyệt...</div>
        ) : posts.length === 0 ? (
          <div className="surface-card rounded-3xl p-10 text-center text-sm text-stone-500">Chưa có bài viết để kiểm duyệt.</div>
        ) : posts.map((post) => (
          <div
            key={post.id}
            className="surface-card space-y-3 rounded-3xl p-5 sm:p-6"
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
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Khôi phục hiển thị
                </button>
              )}

              {post.status === "published" && (
                <button
                  onClick={() => handleAction(post.id, "hide")}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <EyeOff className="h-3.5 w-3.5" /> Tạm ẩn bài viết
                </button>
              )}

              {post.status !== "deleted" && (
                <button
                  onClick={() => handleAction(post.id, "delete")}
                  disabled={isProcessing}
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
