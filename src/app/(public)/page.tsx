"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  HeartHandshake,
  MessageSquarePlus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (post.status !== "published") return false;
      if (selectedTeacherId !== "all" && post.target_teacher_id !== selectedTeacherId) {
        return false;
      }

      if (!query) return true;

      return [post.processed_text, post.display_target, post.display_sender]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [posts, searchQuery, selectedTeacherId]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".hero-section", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
      });

      gsap.from(".hero-logo", {
        scale: 0.88,
        opacity: 0,
        duration: 0.5,
        delay: 0.08,
        ease: "back.out(1.4)",
      });

      gsap.from(".post-item", {
        y: 14,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        delay: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="hero-section relative isolate overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-8 text-white shadow-2xl shadow-orange-950/10 sm:px-10 sm:py-12 lg:px-14">
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="hero-logo mb-6">
              <Logo size="md" showText={false} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Không gian lắng nghe & thấu hiểu
            </div>

            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
              Nói điều cần nói.
              <span className="mt-1 block bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                Nhẹ nhàng hơn.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
              Trải Lòng Trần Phú là diễn đàn phản hồi ẩn danh cho học sinh, giáo viên và nhà trường.
              AI giúp làm dịu câu chữ, giữ nguyên ý chính và đưa những góp ý hữu ích đến đúng người.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-stone-950 shadow-lg shadow-amber-950/20 transition-transform hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Gửi phản hồi
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/policies"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
              >
                <HeartHandshake className="h-4 w-4 text-amber-200" />
                Cách hoạt động
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[19rem] lg:grid-cols-2">
            {[
              ["Ẩn danh", "mặc định"],
              ["AI Luna", "làm dịu"],
              ["1 bài", "mỗi ngày"],
              ["100%", "góp ý thật"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xl font-black text-amber-200">{value}</div>
                <div className="mt-1 text-xs font-medium text-stone-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card rounded-3xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Tìm kiếm phản hồi</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Tìm nội dung, thầy cô hoặc alias..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
            />
          </label>

          <label className="relative sm:w-72">
            <span className="sr-only">Lọc theo người nhận</span>
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <select
              value={selectedTeacherId}
              onChange={(event) => setSelectedTeacherId(event.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white pl-11 pr-4 text-sm font-semibold text-stone-700 transition-colors focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
            >
              <option value="all">Tất cả đối tượng</option>
              {mockDatabase.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.display_name} · {teacher.subject}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section aria-labelledby="feed-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="eyebrow text-amber-700">Bảng tin cộng đồng</p>
            <h2 id="feed-heading" className="mt-1 text-2xl font-black tracking-tight text-stone-900">
              Những điều đang được lắng nghe
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500" aria-live="polite">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            {filteredPosts.length} phản hồi đang hiển thị
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="surface-card rounded-3xl border-dashed p-12 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-4 text-sm font-bold text-stone-800">Chưa có phản hồi phù hợp</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-stone-500">
              Thử một từ khóa khác hoặc đặt bộ lọc về tất cả đối tượng.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-item">
                <PostCard
                  post={post}
                  onDeleted={(id) => setPosts((current) => current.filter((item) => item.id !== id))}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
