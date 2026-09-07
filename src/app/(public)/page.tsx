"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { MessageSquarePlus, Search, Sparkles, Filter, HeartHandshake } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { Logo } from "@/components/ui/Logo";
import { mockDatabase } from "@/lib/db";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { PostPublic } from "@/types";

gsap.registerPlugin(useGSAP);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
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

  useGSAP(
    () => {
      // Smooth, non-destructive glide-in: elements are never blank
      gsap.from(".hero-section", {
        y: 15,
        opacity: 0.7,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      });

      gsap.from(".hero-logo", {
        scale: 0.85,
        duration: 0.45,
        ease: "back.out(1.5)",
        clearProps: "all",
      });

      gsap.from(".post-item", {
        y: 20,
        opacity: 0.6,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Modern Hero Section */}
      <section className="hero-section relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-b from-amber-100 via-orange-50 to-white p-6 sm:p-10 text-center shadow-md">
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Hero Mark */}
          <div className="hero-logo mb-4">
            <Logo size="lg" showText={false} />
          </div>

          <div className="hero-badge inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-900 border border-amber-300/60 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            Không gian lắng nghe & thấu hiểu
          </div>

          <h1 className="hero-title mt-4 text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
            Trải Lòng <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Trần Phú</span>
          </h1>

          <p className="hero-desc mx-auto mt-3.5 max-w-xl text-xs sm:text-sm leading-relaxed text-stone-600 font-normal">
            Diễn đàn phản hồi ẩn danh dành cho học sinh, giáo viên và nhà trường.
            Mọi chia sẻ đều được AI tự động làm dịu lời văn và truyền tải một cách tôn trọng, văn minh.
          </p>

          <div className="hero-actions mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Gửi phản hồi của bạn
            </Link>
            <Link
              href="/policies"
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white/90 backdrop-blur-sm px-5 py-3 text-xs sm:text-sm font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
            >
              <HeartHandshake className="h-4 w-4 text-stone-500" />
              Tìm hiểu chính sách
            </Link>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="filter-bar flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, thầy cô hoặc người gửi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200/80 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-500 hidden sm:block" />
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full sm:w-auto rounded-2xl border border-stone-200/80 bg-white py-3 px-4 text-xs sm:text-sm text-stone-700 font-medium focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs transition-all cursor-pointer"
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

      {/* Posts Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            Phản hồi mới nhất ({filteredPosts.length})
          </h2>
          <span className="text-xs text-stone-400 font-medium">Cập nhật theo thời gian thực</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300/80 bg-white p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-stone-700">
              Không tìm thấy phản hồi nào phù hợp.
            </p>
            <p className="text-xs text-stone-400">
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn giáo viên khác.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-item">
                <PostCard
                  post={post}
                  onDeleted={(id) => {
                    setPosts((prev) => prev.filter((p) => p.id !== id));
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
