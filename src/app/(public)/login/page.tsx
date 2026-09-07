"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleOAuthLogin(provider: "google" | "github") {
    setLoadingProvider(provider);
    setErrorMessage("");

    const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (demoEnabled) {
      window.setTimeout(() => {
        window.location.href = "/onboarding";
      }, 500);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      });
      if (error) setErrorMessage(error.message);
    } catch {
      setErrorMessage(`Chưa cấu hình đăng nhập ${provider === "google" ? "Google" : "GitHub"}. Vui lòng thử lại sau.`);
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:py-20">
      <div className="mb-8 text-center">
        <Logo size="lg" showText={false} />
        <p className="eyebrow mt-6 text-amber-700">Chào mừng bạn đến TLTP</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Đăng nhập để lên tiếng</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Tài khoản đăng nhập giúp giới hạn spam và giữ quyền quản lý bài viết của chính bạn.</p>
      </div>

      <div className="surface-card rounded-[2rem] p-5 sm:p-8">
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={loadingProvider !== null}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-extrabold text-stone-800 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {loadingProvider === "google" ? "Đang mở Google..." : "Tiếp tục với Google"}
        </button>

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-stone-200" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">hoặc</span>
          <span className="h-px flex-1 bg-stone-200" />
        </div>

        <button
          type="button"
          onClick={() => handleOAuthLogin("github")}
          disabled={loadingProvider !== null}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-stone-950 px-4 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18A10.96 10.96 0 0 1 12 6.32c.98 0 1.95.13 2.86.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.4-2.71 5.38-5.29 5.67.42.36.78 1.06.78 2.14v3.06c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
          </svg>
          {loadingProvider === "github" ? "Đang mở GitHub..." : "Tiếp tục với GitHub"}
        </button>

        {errorMessage && <p role="alert" className="mt-4 text-sm font-semibold text-rose-600">{errorMessage}</p>}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs leading-5 text-emerald-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>Danh tính Google/GitHub chỉ dùng cho auth, quota và phân quyền. Không hiển thị trên bảng tin công khai.</span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-stone-400">
        Tiếp tục nghĩa là bạn đồng ý với <Link href="/policies" className="font-bold text-amber-700 hover:underline">chính sách TLTP</Link>.
      </p>
    </div>
  );
}
