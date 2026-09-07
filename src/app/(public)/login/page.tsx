"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".login-logo", {
        scale: 0.7,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      })
        .from(
          ".login-heading",
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          ".login-card",
          {
            y: 30,
            autoAlpha: 0,
            duration: 0.6,
          },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  function handleGoogleLogin() {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/onboarding";
    }, 800);
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-md px-4 py-16 text-center space-y-6">
      <div className="login-logo flex justify-center">
        <Logo size="lg" showText={false} />
      </div>

      <div className="login-heading space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
          Đăng nhập vào TLTP
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          Đăng nhập bằng tài khoản Google để chia sẻ phản hồi và trải nghiệm học đường.
        </p>
      </div>

      <div className="login-card rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-stone-300 bg-white py-3.5 px-4 text-xs sm:text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all duration-200 shadow-xs active:scale-99 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isLoading ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
        </button>

        <div className="flex items-center gap-2.5 rounded-2xl bg-stone-50 p-3.5 text-[11px] text-stone-500 text-left border border-stone-100">
          <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            Thông tin tài khoản chỉ dùng để kiểm soát giới hạn (1 bài/ngày) và không bao giờ hiển thị công khai.
          </span>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <Link href="/policies" className="text-amber-700 hover:underline font-medium">
          Chính sách bảo mật
        </Link>{" "}
        của TLTP.
      </p>
    </div>
  );
}
