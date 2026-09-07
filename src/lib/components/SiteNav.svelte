<script lang="ts">
  import { page } from "$app/stores";
  import { BookOpen, LogIn, Menu, MessageCircleHeart, MessageSquarePlus, ShieldCheck, User, X } from "@lucide/svelte";
  import Logo from "$lib/components/Logo.svelte";

  let isMenuOpen = false;
  const navItems = [
    { href: "/", label: "Bảng tin", icon: MessageCircleHeart },
    { href: "/submit", label: "Gửi phản hồi", icon: MessageSquarePlus },
    { href: "/my-posts", label: "Bài của tôi", icon: User },
    { href: "/policies", label: "Chính sách", icon: BookOpen },
    { href: "/admin/reports", label: "Quản trị", icon: ShieldCheck },
    { href: "/login", label: "Đăng nhập", icon: LogIn },
  ];

  function isActive(href: string) {
    const pathname = $page.url.pathname;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffaf5]/90 shadow-sm backdrop-blur-xl">
  <div class="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="flex shrink-0 items-center" onclick={() => (isMenuOpen = false)}><Logo /></a>

    <nav aria-label="Điều hướng chính" class="hidden items-center gap-1 lg:flex">
      {#each navItems as item}
        <a
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          class:active-nav={isActive(item.href)}
          class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-amber-100/70 hover:text-stone-950"
        >
          <svelte:component this={item.icon} size={16} class={isActive(item.href) ? "text-amber-300" : "text-stone-400"} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <button type="button" aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={isMenuOpen} class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm lg:hidden" onclick={() => (isMenuOpen = !isMenuOpen)}>
      {#if isMenuOpen}<X size={20} />{:else}<Menu size={20} />{/if}
    </button>
  </div>

  {#if isMenuOpen}
    <nav aria-label="Điều hướng di động" class="grid gap-1 border-t border-stone-200/80 bg-white px-4 py-3 lg:hidden">
      {#each navItems as item}
        <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined} class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold" class:bg-stone-900={isActive(item.href)} class:text-white={isActive(item.href)} onclick={() => (isMenuOpen = false)}>
          <svelte:component this={item.icon} size={16} />
          {item.label}
        </a>
      {/each}
    </nav>
  {/if}
</header>

<style>
  .active-nav {
    background: #1c1917;
    color: white;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
  }
</style>
