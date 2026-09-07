import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/onboarding";

  // In production with real Supabase credentials, exchange code for session:
  // const supabase = await createServerClient(...)
  // await supabase.auth.exchangeCodeForSession(code)

  if (code) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // Fallback to onboarding
  return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
}
