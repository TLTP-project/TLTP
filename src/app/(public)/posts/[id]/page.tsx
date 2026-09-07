"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { mockDatabase } from "@/lib/db";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const post = mockDatabase.posts.find((p) => p.id === id);

  if (!post || post.status === "deleted") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-stone-900">Bài viết không tồn tại</h1>
        <p className="text-xs text-stone-500">
          Bài viết có thể đã bị gỡ bỏ hoặc liên kết không chính xác.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Bảng tin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại Bảng tin
      </Link>

      <PostCard post={post} />
    </div>
  );
}
