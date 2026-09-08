<script lang="ts">
  export let showText = true;
  export let size: "sm" | "md" = "sm";
</script>

<div class="flex items-center gap-2" aria-label="TLTP">
  <img
    src="/icon.svg"
    alt=""
    aria-hidden="true"
    class={`rounded-xl shadow-lg shadow-amber-500/15 ${size === "md" ? "h-12 w-12" : "h-9 w-9"}`}
  />
  {#if showText}
    <span class={`font-black tracking-tight text-stone-950 ${size === "md" ? "text-xl" : "text-base"}`}>TLTP</span>
  {/if}
</div>
