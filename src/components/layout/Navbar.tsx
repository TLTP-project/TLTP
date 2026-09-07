"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, BookOpen, ShieldCheck, User, MessageCircleHeart } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold shadow-sm">
            T
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-stone-900">
              Trải Lòng Trần Phú
            </span>
            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              TLTP
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-50 text-amber-900 font-semibold"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
