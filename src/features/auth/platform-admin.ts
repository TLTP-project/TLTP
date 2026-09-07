import type { User } from "better-auth";
import { env } from "$lib/config/env";
import { sql } from "$lib/server/db";

function csvValues(value: string): Set<string> {
  return new Set(value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Better Auth stores the provider profile as the user name; keep a small
 * fallback chain so an explicitly configured GitHub login can bootstrap an
 * administrator on first OAuth sign-in. */
export function getGitHubLogin(user: User): string | null {
  return textValue(user.name) ?? (user.email ? textValue(user.email.split("@")[0]) : null);
}

export async function syncPlatformAdminFromGitHub(user: User): Promise<boolean> {
  const bootstrapUserIds = csvValues(env.ADMIN_USER_IDS);
  const isBootstrapAdmin = bootstrapUserIds.has(user.id.toLowerCase());
  const githubLogin = getGitHubLogin(user);
  const configuredLogins = csvValues(env.ADMIN_GITHUB_LOGINS);
  const isConfiguredAdmin = Boolean(githubLogin && configuredLogins.has(githubLogin.toLowerCase()));

  if (!env.DATABASE_URL) return isBootstrapAdmin || isConfiguredAdmin;

  try {
    const existing = await sql`
      SELECT grant_source FROM platform_admins WHERE user_id = ${user.id} LIMIT 1
    `;

    if (isConfiguredAdmin) {
      await sql`
        INSERT INTO platform_admins (user_id, github_login, grant_source, created_at, updated_at)
        VALUES (${user.id}, ${githubLogin}, 'environment', NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          github_login = EXCLUDED.github_login,
          grant_source = CASE WHEN platform_admins.grant_source = 'manual' THEN 'manual' ELSE 'environment' END,
          updated_at = NOW()
      `;
      return true;
    }

    if (existing[0]?.grant_source === "environment") {
      await sql`DELETE FROM platform_admins WHERE user_id = ${user.id} AND grant_source = 'environment'`;
    }

    return isBootstrapAdmin || existing[0]?.grant_source === "manual";
  } catch (error) {
    console.error("Unable to synchronize platform administrator access:", error);
    return isBootstrapAdmin || isConfiguredAdmin;
  }
}

export async function isPlatformAdmin(user: User): Promise<boolean> {
  return syncPlatformAdminFromGitHub(user);
}
