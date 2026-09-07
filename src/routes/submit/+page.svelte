<script lang="ts">
  import { goto } from "$app/navigation";
  import { LoaderCircle, Send, Sparkles } from "@lucide/svelte";
  import { onMount } from "svelte";

  let role: "student" | "teacher" | "school" = "student";
  let text = "";
  let turnstileToken = "";
  let submitting = false;
  let error = "";
  let success = "";

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") === "teacher" || params.get("role") === "school") role = params.get("role") as typeof role;
  });

  async function submit() {
    submitting = true;
    error = "";
    success = "";
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, text, turnstile_token: turnstileToken }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Không thể gửi phản hồi.");
      success = "Đã xử lý và đăng phản hồi lên bảng tin.";
      text = "";
      setTimeout(() => goto("/"), 900);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Không thể gửi phản hồi.";
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head><title>Gửi phản hồi · TLTP</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
  <div class="mb-8"><p class="eyebrow text-amber-700">Không cần chọn người nhận</p><h1 class="mt-3 text-4xl font-black tracking-tight text-stone-900">Bạn muốn nói điều gì?</h1><p class="mt-3 max-w-2xl text-sm leading-7 text-stone-500">AI sẽ đọc nội dung, tự nhận diện thầy cô nếu có thể, làm dịu câu chữ và đăng thẳng phản hồi phù hợp lên bảng tin.</p></div>
  <form class="surface-card space-y-7 rounded-3xl p-6 sm:p-8" onsubmit={(event) => { event.preventDefault(); submit(); }}>
    <div class="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><div class="flex items-center gap-2 font-bold"><Sparkles size={17} /> AI tự nhận diện người nhận</div><p class="mt-1 text-amber-800/80">Không cần dropdown thầy cô. Nếu nội dung không đủ rõ, bài vẫn hiển thị với nhãn chung.</p></div>
    <fieldset><legend class="text-sm font-bold text-stone-800">Vai trò của bạn</legend><div class="mt-3 grid gap-3 sm:grid-cols-3">{#each [{ value: "student", label: "Học sinh" }, { value: "teacher", label: "Giáo viên" }, { value: "school", label: "Nhà trường" }] as option}<label class="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition" class:border-amber-500={role === option.value} class:bg-amber-50={role === option.value}><input class="accent-amber-500" type="radio" name="role" value={option.value} checked={role === option.value} onchange={() => (role = option.value as typeof role)} />{option.label}</label>{/each}</div></fieldset>
    <div><label class="text-sm font-bold text-stone-800" for="feedback">Nội dung phản hồi</label><textarea id="feedback" bind:value={text} maxlength="1500" minlength="10" rows="9" required class="mt-3 w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-900 shadow-inner placeholder:text-stone-400" placeholder="Viết điều bạn muốn nhà trường hoặc thầy cô lắng nghe..."></textarea><div class="mt-2 flex justify-between text-xs text-stone-400"><span>Tối thiểu 10 ký tự</span><span>{text.length}/1500</span></div></div>
    {#if error}<p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>{/if}
    {#if success}<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>{/if}
    <button disabled={submitting} type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">{#if submitting}<LoaderCircle class="animate-spin" size={18} /> Đang xử lý bằng AI...{:else}<Send size={18} /> Gửi và đăng ngay{/if}</button>
  </form>
</div>
