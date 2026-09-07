<script lang="ts">
  export let showText = true;
  export let size: "sm" | "md" = "sm";
</script>

<div class="flex items-center gap-2" aria-label="TLTP">
  <span class={`grid place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20 ${size === "md" ? "h-12 w-12 text-xl" : "h-9 w-9 text-base"}`} aria-hidden="true">✦</span>
  {#if showText}
    <span class={`font-black tracking-tight text-stone-950 ${size === "md" ? "text-xl" : "text-base"}`}>TLTP</span>
  {/if}
</div>
