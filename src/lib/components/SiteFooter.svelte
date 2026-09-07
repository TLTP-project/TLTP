<script lang="ts">
  import Logo from "$lib/components/Logo.svelte";
</script>

<footer class="mt-auto border-t border-stone-200/80 bg-white/70">
  <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div class="flex items-center gap-2"><Logo size="sm" showText={false} /><span>Trải Lòng Trần Phú · Lắng nghe • Thấu hiểu • Cải thiện</span></div>
    <div class="flex gap-3"><a class="hover:text-stone-900" href="/policies">Chính sách bảo mật</a><span>•</span><a class="hover:text-stone-900" href="/policies">Quy chuẩn nội dung</a></div>
  </div>
</footer>
