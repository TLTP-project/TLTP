<script lang="ts">
  import { onMount } from "svelte";
  import Lenis from "lenis";

  onMount(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.08,
      smoothWheel: true,
    });

    return () => lenis.destroy();
  });
</script>
