<script lang="ts">
  import { Settings, User } from "@lucide/svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: displayName = data.user.name?.trim() || data.user.email?.split("@")[0] || "Tài khoản";
</script>

<svelte:head><title>Cài đặt tài khoản · TLTP</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:py-14">
  <div>
    <p class="eyebrow text-amber-700">Tài khoản</p>
    <h1 class="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight text-stone-900"><Settings class="text-amber-600" size={32} /> Cài đặt</h1>
    <p class="mt-3 text-sm text-stone-500">Thông tin đăng nhập của bạn được quản lý qua nhà cung cấp tài khoản.</p>
  </div>

  <section class="surface-card rounded-3xl p-6 sm:p-8">
    <div class="flex items-center gap-4">
      {#if data.user.image}
        <img src={data.user.image} alt={displayName} class="h-16 w-16 rounded-2xl object-cover" referrerpolicy="no-referrer" />
      {:else}
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-amber-300"><User size={28} /></div>
      {/if}
      <div>
        <h2 class="text-xl font-black text-stone-900">{displayName}</h2>
        {#if data.user.email}<p class="mt-1 text-sm text-stone-500">{data.user.email}</p>{/if}
      </div>
    </div>
    <div class="mt-7 rounded-2xl bg-amber-50 px-4 py-4 text-sm leading-6 text-stone-700">
      Muốn đổi tên hoặc ảnh đại diện, hãy cập nhật trực tiếp ở GitHub/Google rồi đăng nhập lại.
    </div>
  </section>
</div>
