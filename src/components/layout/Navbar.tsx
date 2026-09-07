"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, BookOpen, ShieldCheck, User, MessageCircleHeart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Bảng tin", icon: MessageCircleHeart },
    { href: "/submit", label: "Gửi phản hồi", icon: MessageSquarePlus },
    { href: "/my-posts", label: "Bài của tôi", icon: User },
    { href: "/policies", label: "Chính sách", icon: BookOpen },
    { href: "/admin/reports", label: "Quản trị", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 group">
          <Logo size="sm" showTagline={false} />
        </Link>

        {/* Navigation Links - Fully visible, high contrast, non-overflowing */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? "bg-amber-100 text-amber-950 border border-amber-300/80 shadow-xs"
                    : "text-stone-700 hover:bg-amber-50/70 hover:text-amber-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive ? "text-amber-700" : "text-stone-500"
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
