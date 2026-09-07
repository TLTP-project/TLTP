<script lang="ts">
  import { ShieldCheck } from "@lucide/svelte";
  import type { LayoutData } from "./$types";
  export let data: LayoutData;
</script>
<div class="mx-auto max-w-6xl space-y-7 px-4 py-10 sm:px-6 lg:py-14"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow text-amber-700">Khu vực bảo vệ</p><h1 class="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight text-stone-900"><ShieldCheck class="text-amber-600" size={32} /> Quản trị</h1></div><span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{data.currentUser.email}</span></div><nav class="flex flex-wrap gap-2 text-sm font-bold"><a class="rounded-xl bg-stone-950 px-4 py-2 text-white" href="/admin/reports">Báo cáo</a><a class="rounded-xl border border-stone-200 bg-white px-4 py-2 text-stone-700" href="/admin/moderation">Kiểm duyệt</a></nav><slot /></div>
