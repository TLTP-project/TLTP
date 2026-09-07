import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/onboarding";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  if (code && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
      }
      console.error("Supabase OAuth callback failed:", error);
    } catch (error) {
      console.error("Supabase OAuth callback error:", error);
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback", requestUrl.origin));
}
