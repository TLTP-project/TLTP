<script lang="ts">
  import PostCard from "$lib/components/PostCard.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let posts = data.posts;

  function removePost(postId: string) {
    posts = posts.filter((post) => post.id !== postId);
  }
</script>

<section class="space-y-5">
  <div class="surface-card rounded-3xl px-5 py-5 sm:px-6">
    <h2 class="font-black text-stone-900">Kiểm duyệt bài viết</h2>
    <p class="mt-2 text-sm leading-6 text-stone-500">Danh sách này giống Bảng tin. Bạn có thể xóa bài trực tiếp; thao tác sẽ được ghi vào audit log.</p>
    <p class="mt-3 text-sm font-bold text-stone-700">{posts.length} bài đang hiển thị</p>
  </div>

  {#if posts.length}
    <div class="grid gap-5 lg:grid-cols-2">
      {#each posts as post (post.id)}
        <PostCard {post} canReport={false} canDelete={true} onDeleted={removePost} />
      {/each}
    </div>
  {:else}
    <div class="surface-card rounded-3xl p-10 text-center">
      <p class="text-lg font-bold text-stone-800">Không còn bài công khai.</p>
      <p class="mt-2 text-sm text-stone-500">Các bài mới sẽ xuất hiện ở đây sau khi được đăng.</p>
    </div>
  {/if}
</section>
