"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquarePlus, BookOpen, ShieldCheck, User, MessageCircleHeart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Bảng tin", icon: MessageCircleHeart },
    { href: "/submit", label: "Gửi phản hồi", icon: MessageSquarePlus },
    { href: "/my-posts", label: "Bài của tôi", icon: User },
    { href: "/policies", label: "Chính sách", icon: BookOpen },
    ...((process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true")
      ? [{ href: "/admin/reports", label: "Quản trị demo", icon: ShieldCheck }]
      : []),
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function isItemActive(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffaf5]/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <Logo size="sm" showTagline={false} />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-amber-100/70 hover:text-stone-950"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-amber-300" : "text-stone-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition-colors hover:bg-amber-50 lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-stone-200/80 bg-white px-4 py-3 shadow-lg lg:hidden">
          <nav id="mobile-navigation" aria-label="Điều hướng di động" className="mx-auto grid max-w-6xl gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-700 hover:bg-amber-50 hover:text-stone-950"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
