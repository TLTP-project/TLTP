"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  function handleGoogleLogin() {
    setIsLoading(true);
    // The local demo has no OAuth provider configured yet; production setup uses Supabase Google OAuth.
    window.setTimeout(() => {
      window.location.href = "/onboarding";
    }, 500);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:py-20">
      <div className="mb-8 text-center">
        <Logo size="lg" showText={false} />
        <p className="eyebrow mt-6 text-amber-700">Chào mừng bạn đến TLTP</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Đăng nhập để lên tiếng</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Một tài khoản Google giúp giới hạn spam và giữ quyền quản lý bài viết của chính bạn.</p>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-8">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-extrabold text-stone-800 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {isLoading ? "Đang mở bước tiếp theo..." : "Tiếp tục với Google"}
        </button>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs leading-5 text-emerald-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>Google identity chỉ dùng cho auth, quota và quyền xoá bài. Không hiển thị trên bảng tin công khai.</span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-stone-400">
        Tiếp tục nghĩa là bạn đồng ý với <Link href="/policies" className="font-bold text-amber-700 hover:underline">chính sách TLTP</Link>.
      </p>
    </div>
  );
}
