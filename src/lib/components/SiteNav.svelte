<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { BookOpen, ChevronDown, LogIn, LogOut, Menu, MessageCircleHeart, MessageSquarePlus, Settings, ShieldCheck, User, X } from "@lucide/svelte";
  import { authClient } from "$lib/auth/client";
  import Logo from "$lib/components/Logo.svelte";

  type NavUser = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };

  export let user: NavUser | null = null;

  let isMenuOpen = false;
  let isProfileOpen = false;
  let isSigningOut = false;

  const navItems = [
    { href: "/", label: "Bảng tin", icon: MessageCircleHeart },
    { href: "/submit", label: "Gửi phản hồi", icon: MessageSquarePlus },
    { href: "/my-posts", label: "Bài của tôi", icon: User },
    { href: "/policies", label: "Chính sách", icon: BookOpen },
    { href: "/admin/reports", label: "Quản trị", icon: ShieldCheck },
  ];

  function isActive(href: string) {
    const pathname = $page.url.pathname;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  }

  function closeMenus() {
    isMenuOpen = false;
    isProfileOpen = false;
  }

  function getDisplayName() {
    return user?.name?.trim() || user?.email?.split("@")[0] || "Tài khoản";
  }

  function getInitials() {
    const initials = getDisplayName()
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    return initials || "U";
  }

  async function signOut() {
    if (isSigningOut) return;
    isSigningOut = true;

    try {
      await authClient.signOut();
      closeMenus();
      await invalidateAll();
      await goto("/");
    } finally {
      isSigningOut = false;
    }
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffaf5]/90 shadow-sm backdrop-blur-xl">
  <div class="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="flex shrink-0 items-center" onclick={closeMenus}><Logo /></a>

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

      {#if user}
        <div class="relative ml-1">
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
            aria-label="Mở menu tài khoản"
            aria-expanded={isProfileOpen}
            onclick={() => (isProfileOpen = !isProfileOpen)}
          >
            {#if user.image}
              <img src={user.image} alt={getDisplayName()} class="h-8 w-8 rounded-full object-cover" referrerpolicy="no-referrer" />
            {:else}
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-black text-amber-300">{getInitials()}</span>
            {/if}
            <span class="max-w-28 truncate text-xs font-bold text-stone-800">{getDisplayName()}</span>
            <ChevronDown size={15} class="text-stone-400" />
          </button>

          {#if isProfileOpen}
            <div class="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
              <div class="border-b border-stone-100 px-3 pb-3 pt-2">
                <p class="truncate text-sm font-black text-stone-900">{getDisplayName()}</p>
                {#if user.email}<p class="mt-1 truncate text-xs text-stone-500">{user.email}</p>{/if}
              </div>
              <a href="/settings" class="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100" onclick={closeMenus}>
                <Settings size={16} class="text-stone-400" /> Cài đặt tài khoản
              </a>
              <a href="/my-posts" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100" onclick={closeMenus}>
                <User size={16} class="text-stone-400" /> Bài của tôi
              </a>
              <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50" disabled={isSigningOut} onclick={signOut}>
                <LogOut size={16} /> {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <a href="/login" aria-current={isActive("/login") ? "page" : undefined} class:active-nav={isActive("/login")} class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-amber-100/70 hover:text-stone-950">
          <LogIn size={16} class={isActive("/login") ? "text-amber-300" : "text-stone-400"} />
          <span>Đăng nhập</span>
        </a>
      {/if}
    </nav>

    <div class="flex items-center gap-2 lg:hidden">
      {#if user}
        <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm" aria-label="Mở menu tài khoản" aria-expanded={isProfileOpen} onclick={() => (isProfileOpen = !isProfileOpen)}>
          {#if user.image}<img src={user.image} alt={getDisplayName()} class="h-8 w-8 rounded-full object-cover" referrerpolicy="no-referrer" />{:else}<span class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-black text-amber-300">{getInitials()}</span>{/if}
        </button>
      {/if}
      <button type="button" aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={isMenuOpen} class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm" onclick={() => (isMenuOpen = !isMenuOpen)}>
        {#if isMenuOpen}<X size={20} />{:else}<Menu size={20} />{/if}
      </button>
    </div>
  </div>

  {#if isMenuOpen}
    <nav aria-label="Điều hướng di động" class="grid gap-1 border-t border-stone-200/80 bg-white px-4 py-3 lg:hidden">
      {#each navItems as item}
        <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined} class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold" class:bg-stone-900={isActive(item.href)} class:text-white={isActive(item.href)} onclick={closeMenus}>
          <svelte:component this={item.icon} size={16} />
          {item.label}
        </a>
      {/each}
      {#if user}
        <a href="/settings" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-700" onclick={closeMenus}><Settings size={16} /> Cài đặt tài khoản</a>
        <button type="button" class="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-700" disabled={isSigningOut} onclick={signOut}><LogOut size={16} /> {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}</button>
      {:else}
        <a href="/login" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-700" onclick={closeMenus}><LogIn size={16} /> Đăng nhập</a>
      {/if}
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
