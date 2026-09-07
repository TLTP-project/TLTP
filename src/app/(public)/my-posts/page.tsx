"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquarePlus, Trash2 } from "lucide-react";
import { mockDatabase } from "@/lib/db";
import { getCurrentDevUser } from "@/features/auth/client";
import type { PostPublic } from "@/types";

export default function MyPostsPage() {
  const user = getCurrentDevUser();
  const [posts, setPosts] = useState<PostPublic[]>(
    user ? mockDatabase.posts.filter((post) => post.author_id === user.id) : []
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) return;

    fetch("/api/account/posts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => setErrorMessage("Không thể tải bài viết của bạn."));
  }, [user]);

  async function handleDelete(postId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ bài viết này khỏi bảng tin?")) return;

    setErrorMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error || "Không thể gỡ bài viết.");
        return;
      }

      setPosts((current) => current.map((post) => (
        post.id === postId ? { ...post, status: "deleted" } : post
      )));
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-amber-700">Không gian của bạn</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Bài viết của tôi</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
            Theo dõi những điều bạn đã chia sẻ. Danh tính vẫn được ẩn trên bảng tin công khai.
          </p>
        </div>
        <Link href="/submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-stone-950/10 transition-transform hover:-translate-y-0.5 hover:bg-stone-800">
          <MessageSquarePlus className="h-4 w-4" />
          Gửi bài mới
        </Link>
      </div>

      {errorMessage && <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{errorMessage}</p>}

      {posts.length === 0 ? (
        <div className="surface-card mt-8 rounded-3xl border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">✦</div>
          <p className="mt-4 text-sm font-bold text-stone-800">Bạn chưa gửi phản hồi nào.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-stone-500">Một góp ý nhỏ cũng có thể làm lớp học tốt hơn.</p>
          <Link href="/submit" className="mt-5 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700">Chia sẻ trải nghiệm</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {posts.map((post) => {
            const isDeleted = post.status === "deleted";
            const formattedDate = new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Ho_Chi_Minh",
            }).format(new Date(post.created_at));

            return (
              <article key={post.id} className={`surface-card rounded-3xl p-5 sm:p-6 ${isDeleted ? "opacity-65" : ""}`}>
                <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600">
                    <span>Gửi tới <strong className="text-stone-900">{post.display_target}</strong></span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-400">{formattedDate}</span>
                  </div>
                  {isDeleted ? (
                    <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">Đã gỡ</span>
                  ) : (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Đang hiển thị</span>
                  )}
                </div>
                <p className="py-5 text-sm leading-7 text-stone-800">{post.processed_text}</p>
                {!isDeleted && (
                  <div className="flex justify-end border-t border-stone-100 pt-4">
                    <button type="button" onClick={() => handleDelete(post.id)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Gỡ bài
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
