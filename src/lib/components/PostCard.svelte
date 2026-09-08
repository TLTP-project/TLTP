<script lang="ts">
  import { ArrowUpRight, Flag, Trash2 } from "@lucide/svelte";
  import type { PostPublic } from "@/types";

  export let post: PostPublic;
  export let canReport = true;
  export let canDelete = false;
  export let onDeleted: ((postId: string) => void) | undefined = undefined;

  let isDeleting = false;
  let deleteError = "";

  const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  async function deletePost() {
    if (!canDelete || isDeleting) return;
    if (!window.confirm("Xóa bài này khỏi bảng tin? Thao tác này sẽ ẩn bài khỏi mọi người.")) return;

    isDeleting = true;
    deleteError = "";
    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "post", post_id: post.id, action: "delete" }),
      });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        deleteError = result.error ?? "Không thể xóa bài viết.";
        return;
      }
      onDeleted?.(post.id);
    } catch {
      deleteError = "Không thể kết nối tới máy chủ.";
    } finally {
      isDeleting = false;
    }
  }
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
    {#if canDelete}
      <div class="flex flex-col items-end gap-1">
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:cursor-wait disabled:opacity-50"
          disabled={isDeleting}
          aria-busy={isDeleting}
          onclick={deletePost}
        >
          <Trash2 size={14} /> {isDeleting ? "Đang xóa..." : "Xóa bài"}
        </button>
        {#if deleteError}<span class="text-right text-[0.7rem] font-semibold text-rose-600">{deleteError}</span>{/if}
      </div>
    {:else if canReport}
      <a class="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rose-600" href={`/posts/${post.id}?report=1`}>
        <Flag size={14} /> Báo cáo
      </a>
    {/if}
  </div>
</article>
