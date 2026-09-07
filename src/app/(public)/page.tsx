"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquarePlus, Search, Sparkles, Filter } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { mockDatabase } from "@/lib/db";
import type { PostPublic } from "@/types";

export default function HomePage() {
  const [posts, setPosts] = useState<PostPublic[]>(mockDatabase.posts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (p.status !== "published") return false;

      const matchesSearch =
        p.processed_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.display_target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.display_sender.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTeacher =
        selectedTeacherId === "all" || p.target_teacher_id === selectedTeacherId;

      return matchesSearch && matchesTeacher;
    });
  }, [posts, searchQuery, selectedTeacherId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-transparent p-6 sm:p-10 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-300/40">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Không gian lắng nghe & thấu hiểu
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
          Trải Lòng Trần Phú
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-stone-600">
          Diễn đàn phản hồi ẩn danh dành cho học sinh, giáo viên và nhà trường.
          Mọi chia sẻ đều được AI tự động làm dịu lời văn và truyền tải một cách tôn trọng, văn minh.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Gửi phản hồi của bạn
          </Link>
          <Link
            href="/policies"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Tìm hiểu chính sách
          </Link>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, thầy cô hoặc người gửi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-500 hidden sm:block" />
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full sm:w-auto rounded-2xl border border-stone-200 bg-white py-2.5 px-3.5 text-xs sm:text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
          >
            <option value="all">Tất cả đối tượng</option>
            {mockDatabase.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name} ({t.subject})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Posts List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-800">
            Phản hồi mới nhất ({filteredPosts.length})
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
            <p className="text-sm text-stone-500">
              Không tìm thấy phản hồi nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={(id) => {
                  setPosts((prev) => prev.filter((p) => p.id !== id));
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
