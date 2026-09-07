<script lang="ts">
  import { goto } from "$app/navigation";
  import { Code2, LoaderCircle, LogIn } from "@lucide/svelte";
  import { authClient } from "$lib/auth/client";

  let loading = "";
  let error = "";

  async function signIn(provider: "github" | "google") {
    loading = provider;
    error = "";
    try {
      await authClient.signIn.social({ provider, callbackURL: "/" });
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Đăng nhập không thành công.";
      loading = "";
    }
  }
</script>

<svelte:head><title>Đăng nhập · TLTP</title></svelte:head>
<div class="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
  <section class="surface-card w-full rounded-3xl p-7 text-center sm:p-9"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-amber-300"><LogIn size={25} /></div><h1 class="mt-5 text-3xl font-black text-stone-900">Đăng nhập TLTP</h1><p class="mt-3 text-sm leading-6 text-stone-500">Chọn tài khoản để gửi phản hồi và quản lý bài viết của bạn.</p><div class="mt-7 grid gap-3"><button type="button" disabled={Boolean(loading)} onclick={() => signIn("github")} class="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-60">{#if loading === "github"}<LoaderCircle class="animate-spin" size={18} />{:else}<Code2 size={18} />{/if} Tiếp tục với GitHub</button><button type="button" disabled={Boolean(loading)} onclick={() => signIn("google")} class="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 hover:bg-stone-50 disabled:opacity-60">{#if loading === "google"}<LoaderCircle class="animate-spin" size={18} />{:else}<span class="text-base font-black text-blue-500">G</span>{/if} Tiếp tục với Google</button></div>{#if error}<p class="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700">{error}</p>{/if}<p class="mt-6 text-xs leading-5 text-stone-400">Bằng việc đăng nhập, bạn đồng ý với <a class="font-bold underline" href="/policies">chính sách cộng đồng</a>.</p></section>
</div>
