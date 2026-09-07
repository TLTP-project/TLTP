"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { mockDatabase } from "@/lib/db";
import type { PostPublic } from "@/types";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<PostPublic | null | undefined>(undefined);

  useEffect(() => {
    const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (demoEnabled) {
      setPost(mockDatabase.posts.find((item) => item.id === id) || null);
      return;
    }

    fetch(`/api/posts/${id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setPost(data?.post || null))
      .catch(() => setPost(null));
  }, [id]);

  if (post === undefined) {
    return <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-24 text-sm text-stone-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Đang tải phản hồi...</div>;
  }

  if (!post || post.status === "deleted") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="eyebrow text-amber-700">Không tìm thấy</p>
        <h1 className="mt-2 text-2xl font-black text-stone-950">Bài viết không tồn tại</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">Bài viết có thể đã được gỡ hoặc liên kết không chính xác.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white hover:bg-stone-800"><ArrowLeft className="h-4 w-4" /> Quay lại bảng tin</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900"><ArrowLeft className="h-4 w-4" /> Quay lại bảng tin</Link>
      <div className="mt-6"><PostCard post={post} /></div>
    </div>
  );
}
