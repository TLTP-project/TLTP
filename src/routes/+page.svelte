<script lang="ts">
  import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "@lucide/svelte";
  import PostCard from "$lib/components/PostCard.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>TLTP · Bảng tin cộng đồng</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 lg:py-12">
  <section class="relative isolate overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14 lg:py-16">
    <div class="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-orange-500/30 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"></div>
    <div class="relative z-10 max-w-2xl">
      <p class="eyebrow text-amber-200">Một góc nhỏ để nói thật</p>
      <h1 class="mt-4 text-4xl font-black tracking-tight sm:text-6xl sm:leading-[1.05]">Nói điều cần nói.<span class="mt-1 block bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">Nhẹ nhàng hơn.</span></h1>
      <p class="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">Trải Lòng Trần Phú là diễn đàn phản hồi ẩn danh. AI giúp làm dịu câu chữ, giữ nguyên ý chính và đưa góp ý hữu ích đến đúng người.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="/submit" class="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-stone-950 hover:bg-amber-200">Gửi phản hồi <ArrowRight size={16} /></a>
        <a href="/policies" class="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">Cách hoạt động</a>
      </div>
    </div>
  </section>

  <section class="grid gap-4 md:grid-cols-3">
    <div class="surface-card rounded-3xl p-5"><HeartHandshake class="text-amber-600" size={22} /><h2 class="mt-4 font-black text-stone-900">Ẩn danh tử tế</h2><p class="mt-2 text-sm leading-6 text-stone-500">Danh tính người gửi không xuất hiện trên bảng tin.</p></div>
    <div class="surface-card rounded-3xl p-5"><Sparkles class="text-amber-600" size={22} /><h2 class="mt-4 font-black text-stone-900">AI làm dịu câu chữ</h2><p class="mt-2 text-sm leading-6 text-stone-500">Giữ ý chính, giảm công kích và tự nhận diện thầy cô.</p></div>
    <div class="surface-card rounded-3xl p-5"><ShieldCheck class="text-amber-600" size={22} /><h2 class="mt-4 font-black text-stone-900">Cộng đồng an toàn</h2><p class="mt-2 text-sm leading-6 text-stone-500">Có báo cáo và kiểm duyệt để mọi người được lắng nghe.</p></div>
  </section>

  <section class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div><p class="eyebrow text-amber-700">Bảng tin cộng đồng</p><h2 class="mt-2 text-3xl font-black tracking-tight text-stone-900">Những điều đang được lắng nghe</h2></div>
      <span class="text-sm font-semibold text-stone-500">{data.posts.length} phản hồi gần đây</span>
    </div>
    {#if data.posts.length}
      <div class="grid gap-5 lg:grid-cols-2">{#each data.posts as post (post.id)}<PostCard {post} />{/each}</div>
    {:else}
      <div class="surface-card rounded-3xl p-10 text-center"><p class="text-lg font-bold text-stone-800">Chưa có phản hồi công khai.</p><p class="mt-2 text-sm text-stone-500">Hãy là người đầu tiên gửi một góp ý tử tế.</p></div>
    {/if}
  </section>
</div>
