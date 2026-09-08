<script lang="ts">
  import { LoaderCircle, Send } from "@lucide/svelte";
  import { onMount } from "svelte";
  import type { CommentPublic } from "@/types";

  export let postId: string;
  export let siteKey = "";
  export let onCreated: (comment: CommentPublic) => void;

  type TurnstileRenderOptions = {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  };

  type TurnstileApi = {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };

  type TurnstileWindow = Window & { turnstile?: TurnstileApi };

  const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  let text = "";
  let turnstileToken = "";
  let turnstileContainer: HTMLDivElement;
  let turnstileWidgetId: string | undefined;
  let turnstileError = "";
  let submitting = false;
  let error = "";
  let success = "";

  function loadTurnstile(): Promise<void> {
    if ((window as TurnstileWindow).turnstile) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>("script[data-tltp-turnstile]");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Không tải được Turnstile.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = turnstileScriptUrl;
      script.async = true;
      script.defer = true;
      script.dataset.tltpTurnstile = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Không tải được Turnstile."));
      document.head.appendChild(script);
    });
  }

  function resetTurnstile() {
    const api = (window as TurnstileWindow).turnstile;
    if (turnstileWidgetId && api) api.reset(turnstileWidgetId);
    turnstileToken = "";
  }

  onMount(() => {
    if (!siteKey) return;
    let disposed = false;
    void loadTurnstile()
      .then(() => {
        if (disposed || !turnstileContainer) return;
        const api = (window as TurnstileWindow).turnstile;
        if (!api) throw new Error("Turnstile chưa sẵn sàng.");
        turnstileWidgetId = api.render(turnstileContainer, {
          sitekey: siteKey,
          callback: (token) => {
            turnstileError = "";
            turnstileToken = token;
          },
          "expired-callback": () => {
            turnstileToken = "";
            turnstileError = "Xác thực đã hết hạn. Vui lòng xác thực lại.";
          },
          "error-callback": () => {
            turnstileToken = "";
            turnstileError = "Không thể tải xác thực chống bot. Vui lòng thử lại.";
          },
        });
      })
      .catch((caught) => {
        if (!disposed) turnstileError = caught instanceof Error ? caught.message : "Không tải được Turnstile.";
      });

    return () => {
      disposed = true;
      const api = (window as TurnstileWindow).turnstile;
      if (turnstileWidgetId && api) api.remove(turnstileWidgetId);
    };
  });

  async function submitComment() {
    if (siteKey && !turnstileToken) {
      error = "Vui lòng hoàn thành xác thực chống bot (Turnstile).";
      return;
    }

    submitting = true;
    error = "";
    success = "";
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, turnstile_token: turnstileToken }),
      });
      const payload = await response.json() as { success?: boolean; comment?: CommentPublic; error?: string };
      if (!response.ok || !payload.success || !payload.comment) throw new Error(payload.error ?? "Không thể đăng bình luận.");
      onCreated(payload.comment);
      text = "";
      success = "Đã đăng bình luận.";
      if (siteKey) resetTurnstile();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Không thể đăng bình luận.";
      if (siteKey) resetTurnstile();
    } finally {
      submitting = false;
    }
  }
</script>

<form class="mt-6 space-y-4" onsubmit={(event) => { event.preventDefault(); submitComment(); }}>
  <label class="block text-sm font-bold text-stone-800" for="comment">Bình luận</label>
  <textarea id="comment" bind:value={text} minlength="10" maxlength="1000" rows="4" required class="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-900 shadow-inner placeholder:text-stone-400" placeholder="Chia sẻ suy nghĩ của bạn về bài viết..."></textarea>
  <div class="flex justify-between text-xs text-stone-400"><span>Tối thiểu 10 ký tự · AI sẽ làm dịu câu chữ</span><span>{text.length}/1000</span></div>
  {#if siteKey}<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4"><p class="mb-3 text-xs font-semibold text-stone-500">Xác thực chống bot trước khi bình luận</p><div bind:this={turnstileContainer}></div>{#if turnstileError}<p class="mt-3 text-sm font-semibold text-rose-700">{turnstileError}</p>{/if}</div>{/if}
  {#if error}<p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>{/if}
  {#if success}<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>{/if}
  <button disabled={submitting || Boolean(siteKey && !turnstileToken)} type="submit" class="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">{#if submitting}<LoaderCircle class="animate-spin" size={17} /> Đang xử lý...{:else}<Send size={17} /> Đăng bình luận{/if}</button>
</form>
