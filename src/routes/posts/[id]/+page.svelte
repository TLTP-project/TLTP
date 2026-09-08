<script lang="ts">
  import { ArrowLeft, Flag, MessageCircle } from "@lucide/svelte";
  import { page } from "$app/stores";
  import CommentForm from "$lib/components/CommentForm.svelte";
  import type { CommentPublic } from "@/types";
  import type { PageData } from "./$types";

  export let data: PageData;
  let reportOpen = $page.url.searchParams.get("report") === "1";
  let reason = "other";
  let details = "";
  let status = "";
  let comments: CommentPublic[] = data.comments;
  const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  async function report() {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ post_id: data.post.id, reason, details }),
    });
    const payload = await response.json();
    status = response.ok && payload.success ? "Đã gửi báo cáo để quản trị viên xem xét." : payload.error ?? "Không thể gửi báo cáo.";
  }
</script>

<svelte:head><title>Phản hồi · TLTP</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
  <a href="/" class="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-amber-700"><ArrowLeft size={16} /> Về bảng tin</a>
  <article class="surface-card mt-7 rounded-3xl p-6 sm:p-9">
    <div class="flex flex-wrap items-center gap-2 text-sm font-bold text-stone-600">
      <span class="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{data.post.display_sender}</span>
      <span>→</span>
      <span class="rounded-full bg-stone-100 px-3 py-1">{data.post.display_target}</span>
    </div>
    {#if data.post.status === "deleted"}
      <div class="mt-7 rounded-2xl bg-stone-100 px-4 py-5 text-sm font-semibold text-stone-500">
        Bài viết đã bị xóa. Nội dung và bình luận không còn hiển thị.
      </div>
    {:else}
      <p class="mt-7 whitespace-pre-wrap text-lg leading-8 text-stone-800">{data.post.processed_text}</p>
      <div class="mt-8 border-t border-stone-200 pt-5">
        <button type="button" onclick={() => (reportOpen = !reportOpen)} class="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-rose-600"><Flag size={16} /> Báo cáo nội dung</button>
        {#if reportOpen}
          <div class="mt-5 space-y-3 rounded-2xl bg-stone-50 p-4">
            <label class="block text-sm font-bold text-stone-700" for="reason">Lý do
              <select id="reason" bind:value={reason} class="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2">
                <option value="harassment">Quấy rối / công kích</option>
                <option value="pii_leak">Lộ thông tin riêng tư</option>
                <option value="safety_threat">Đe doạ an toàn</option>
                <option value="misinformation">Thông tin sai</option>
                <option value="other">Khác</option>
              </select>
            </label>
            <label class="block text-sm font-bold text-stone-700" for="details">Chi tiết
              <textarea id="details" bind:value={details} maxlength="500" rows="3" class="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"></textarea>
            </label>
            <button type="button" onclick={report} class="rounded-xl bg-stone-950 px-4 py-2 text-sm font-bold text-white">Gửi báo cáo</button>
            {#if status}<p class="text-sm font-semibold text-stone-600">{status}</p>{/if}
          </div>
        {/if}
      </div>
    {/if}
  </article>

  {#if data.post.status === "published"}
    <section class="surface-card mt-6 rounded-3xl p-6 sm:p-9" aria-labelledby="comments-heading">
      <div class="flex items-center gap-2">
        <MessageCircle size={20} class="text-amber-700" />
        <h2 id="comments-heading" class="text-xl font-extrabold text-stone-900">Bình luận ({comments.length})</h2>
      </div>
      {#if comments.length > 0}
        <div class="mt-5 space-y-4">
          {#each comments as comment (comment.id)}
            <article class="rounded-2xl bg-stone-50 px-4 py-4">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-stone-500">
                <span class="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{comment.display_sender}</span>
                <time datetime={comment.created_at}>{dateFormatter.format(new Date(comment.created_at))}</time>
              </div>
              <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">{comment.processed_text}</p>
            </article>
          {/each}
        </div>
      {:else}
        <p class="mt-5 text-sm text-stone-500">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ góc nhìn của bạn.</p>
      {/if}
      {#if data.isAuthenticated}
        <CommentForm postId={data.post.id} siteKey={data.turnstileSiteKey} onCreated={(comment) => (comments = [...comments, comment])} />
      {:else}
        <a href="/login" class="mt-6 inline-flex rounded-2xl bg-stone-950 px-4 py-3 text-sm font-extrabold text-white hover:bg-stone-800">Đăng nhập để bình luận</a>
      {/if}
    </section>
  {/if}
</div>
