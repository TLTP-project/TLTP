<script lang="ts">
  import { goto } from "$app/navigation";
  let selected: "student" | "teacher" | "school" = "student";
  let error = "";
  let saving = false;
  async function continueOnboarding() {
    saving = true; error = "";
    const response = await fetch("/api/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: selected }) });
    const data = await response.json();
    if (!response.ok || !data.success) error = data.error ?? "Không thể lưu vai trò.";
    else await goto("/submit");
    saving = false;
  }
</script>
<svelte:head><title>Chọn vai trò · TLTP</title></svelte:head>
<div class="mx-auto max-w-2xl px-4 py-12 sm:px-6"><section class="surface-card rounded-3xl p-7 sm:p-9"><p class="eyebrow text-amber-700">Bước đầu tiên</p><h1 class="mt-3 text-3xl font-black text-stone-900">Bạn đang ở vai trò nào?</h1><p class="mt-3 text-sm leading-6 text-stone-500">Học sinh dùng ngay. Vai trò giáo viên và nhà trường sẽ được xác minh trước khi có quyền tương ứng.</p><div class="mt-7 grid gap-3">{#each [{ value: "student", label: "Học sinh", desc: "Gửi phản hồi ngay" }, { value: "teacher", label: "Giáo viên", desc: "Cần xác minh" }, { value: "school", label: "Nhà trường", desc: "Cần xác minh" }] as option}<label class="cursor-pointer rounded-2xl border p-4" class:border-amber-500={selected === option.value} class:bg-amber-50={selected === option.value}><input class="mr-3 accent-amber-500" type="radio" name="role" checked={selected === option.value} onchange={() => (selected = option.value as typeof selected)} /><span class="font-bold text-stone-900">{option.label}</span><span class="ml-2 text-sm text-stone-500">{option.desc}</span></label>{/each}</div>{#if error}<p class="mt-4 text-sm font-semibold text-rose-700">{error}</p>{/if}<button type="button" disabled={saving} onclick={continueOnboarding} class="mt-7 w-full rounded-2xl bg-stone-950 px-5 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{saving ? "Đang lưu..." : "Tiếp tục"}</button></section></div>
