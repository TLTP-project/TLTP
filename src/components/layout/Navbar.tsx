"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, BookOpen, ShieldCheck, User, MessageCircleHeart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: "/", label: "Bảng tin", icon: MessageCircleHeart },
    { href: "/submit", label: "Gửi phản hồi", icon: MessageSquarePlus },
    { href: "/my-posts", label: "Bài của tôi", icon: User },
    { href: "/policies", label: "Chính sách", icon: BookOpen },
    { href: "/admin/reports", label: "Quản trị", icon: ShieldCheck },
  ];

  useGSAP(
    () => {
      gsap.from(".nav-brand", {
        x: -25,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".nav-link", {
        y: -10,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="nav-brand flex items-center group">
          <Logo size="sm" showTagline={false} />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 font-bold border border-amber-200/70 shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-stone-500"}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
