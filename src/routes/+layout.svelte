<script lang="ts">
  import "../app.css";
  import Lenis from "$lib/components/Lenis.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
  import SiteNav from "$lib/components/SiteNav.svelte";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<svelte:head>
  <title>Trải Lòng Trần Phú (TLTP)</title>
  <meta name="description" content="Diễn đàn phản hồi ẩn danh cho cộng đồng trường học." />
  <link rel="icon" href="/icon.svg" />
</svelte:head>

<Lenis />
<div class="flex min-h-screen flex-col">
  <SiteNav user={data.user} />
  <main class="w-full flex-1"><slot /></main>
  <SiteFooter />
</div>
