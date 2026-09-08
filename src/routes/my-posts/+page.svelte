<script lang="ts">
  import { Trash2 } from "@lucide/svelte";
  import PostCard from "$lib/components/PostCard.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
  let posts = data.posts;
  let message = "";
  async function remove(postId: string) {
    if (!confirm("Gỡ bài này khỏi bảng tin?")) return;
    const response = await fetch("/api/account/posts", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ post_id: postId }) });
    const payload = await response.json();
    if (response.ok && payload.success) posts = posts.map((post) => post.id === postId ? { ...post, status: "deleted", deleted_at: new Date().toISOString() } : post);
    else message = payload.error ?? "Không thể gỡ bài.";
  }
</script>
<svelte:head><title>Bài của tôi · TLTP</title></svelte:head>
<div class="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:py-14"><div><p class="eyebrow text-amber-700">Góc riêng</p><h1 class="mt-3 text-4xl font-black tracking-tight text-stone-900">Bài của tôi</h1><p class="mt-3 text-sm text-stone-500">Bài đã gỡ vẫn được giữ lại dưới dạng trạng thái “Đã bị xóa”; nội dung gốc không khôi phục.</p></div>{#if message}<p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p>{/if}{#if posts.length}<div class="grid gap-5 lg:grid-cols-2">{#each posts as post (post.id)}<div><PostCard {post} canReport={false} /><button type="button" disabled={post.status === "deleted"} onclick={() => remove(post.id)} class="mt-2 inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} /> {post.status === "deleted" ? "Đã bị xóa" : "Gỡ bài"}</button></div>{/each}</div>{:else}<div class="surface-card rounded-3xl p-10 text-center text-sm text-stone-500">Bạn chưa có bài đăng nào.</div>{/if}</div>
