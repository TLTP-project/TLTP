<script lang="ts">
  import { ArrowUpRight, Flag } from "@lucide/svelte";
  import type { PostPublic } from "@/types";

  export let post: PostPublic;
  export let canReport = true;

  const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
</script>

<article class="surface-card rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl sm:p-6">
  <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-stone-500">
    <div class="flex items-center gap-2">
      <span class="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{post.display_sender}</span>
      <span aria-hidden="true">→</span>
      <span class="rounded-full bg-stone-100 px-3 py-1 text-stone-700">{post.display_target}</span>
    </div>
    <time datetime={post.created_at}>{dateFormatter.format(new Date(post.created_at))}</time>
  </div>
  <p class="mt-5 whitespace-pre-wrap text-[0.98rem] leading-7 text-stone-800">{post.processed_text}</p>
  <div class="mt-5 flex items-center justify-between border-t border-stone-200/80 pt-4">
    <a class="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-amber-700" href={`/posts/${post.id}`}>
      Đọc chi tiết <ArrowUpRight size={14} />
    </a>
    {#if canReport}
      <a class="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rose-600" href={`/posts/${post.id}?report=1`}>
        <Flag size={14} /> Báo cáo
      </a>
    {/if}
  </div>
</article>
