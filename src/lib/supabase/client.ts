import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createSupabaseBrowserClient(supabaseUrl, publishableKey);
}
