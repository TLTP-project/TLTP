import "server-only";

import type { User } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";
import { createAdminClient } from "@/lib/db";

function csvValues(value: string): Set<string> {
  return new Set(
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getGitHubLogin(user: User): string | null {
  const githubIdentity = user.identities?.find((identity) => identity.provider === "github");
  const identityData = githubIdentity?.identity_data;

  return (
    textValue(identityData?.user_name) ??
    textValue(identityData?.preferred_username) ??
    textValue(identityData?.login) ??
    textValue(user.user_metadata?.user_name) ??
    textValue(user.user_metadata?.preferred_username)
  );
}

/**
 * Synchronizes GitHub-based administrator access after OAuth completes.
 * Profile roles remain independent from platform administration.
 */
export async function syncPlatformAdminFromGitHub(user: User): Promise<boolean> {
  const bootstrapUserIds = csvValues(env.ADMIN_USER_IDS);
  const isBootstrapAdmin = bootstrapUserIds.has(user.id.toLowerCase());
  const githubLogin = getGitHubLogin(user);

  if (!githubLogin) return isBootstrapAdmin;

  const configuredLogins = csvValues(env.ADMIN_GITHUB_LOGINS);
  const isConfiguredAdmin = configuredLogins.has(githubLogin.toLowerCase());

  try {
    const supabase = createAdminClient();
    const { data: existing, error: readError } = await supabase
      .from("platform_admins")
      .select("grant_source")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) throw readError;

    if (isConfiguredAdmin) {
      const { error } = await supabase.from("platform_admins").upsert({
        user_id: user.id,
        github_login: githubLogin,
        grant_source: existing?.grant_source === "manual" ? "manual" : "environment",
      });
      if (error) throw error;
      return true;
    }

    if (existing?.grant_source === "environment") {
      const { error } = await supabase
        .from("platform_admins")
        .delete()
        .eq("user_id", user.id)
        .eq("grant_source", "environment");
      if (error) throw error;
    }

    return isBootstrapAdmin || existing?.grant_source === "manual";
  } catch (error) {
    console.error("Unable to synchronize GitHub administrator access:", error);
    return isBootstrapAdmin;
  }
}
