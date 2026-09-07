import type { UserRole, Profile, VerificationStatus } from "@/types";
import { env } from "$lib/config/env";
import { sql } from "$lib/server/db";
import { isPlatformAdmin } from "./platform-admin";

export interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
  verificationStatus: VerificationStatus;
  isAdmin: boolean;
}

const mockProfiles = new Map<string, Profile>([
  ["user-student-demo", {
    user_id: "user-student-demo",
    email: "student@tranphu.edu.vn",
    role: "student",
    verification_status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
]);

type AuthIdentity = { id: string; email: string | null; name?: string | null };

function identityFromLocals(locals?: App.Locals): AuthIdentity | null {
  if (locals?.user && typeof locals.user === "object" && "id" in locals.user) {
    const user = locals.user as { id: string; email?: string | null; name?: string | null };
    return { id: user.id, email: user.email ?? null, name: user.name };
  }
  if (env.DEMO_MODE) return { id: "user-student-demo", email: "student@tranphu.edu.vn", name: "Student demo" };
  return null;
}

export async function onboardUserRole(
  userId: string,
  role: UserRole,
  email?: string,
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  const existing = await getUserProfile(userId);
  if (existing?.verification_status === "active") {
    return { success: false, error: "Tài khoản của bạn đã được xác thực vai trò và không thể tự thay đổi." };
  }

  const profile: Profile = {
    user_id: userId,
    email: email ?? existing?.email ?? null,
    role,
    verification_status: role === "student" ? "active" : "pending_verification",
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (env.DEMO_MODE || !env.DATABASE_URL) {
    mockProfiles.set(userId, profile);
    return { success: true, profile };
  }

  await sql`
    INSERT INTO profiles (user_id, email, role, verification_status, created_at, updated_at)
    VALUES (${profile.user_id}, ${profile.email}, ${profile.role}, ${profile.verification_status}, ${profile.created_at}, ${profile.updated_at})
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      verification_status = EXCLUDED.verification_status,
      updated_at = EXCLUDED.updated_at
  `;
  return { success: true, profile };
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (env.DEMO_MODE || !env.DATABASE_URL) return mockProfiles.get(userId) ?? null;

  const rows = await sql`
    SELECT user_id, email, role, verification_status, created_at, updated_at
    FROM profiles WHERE user_id = ${userId} LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    user_id: String(row.user_id),
    email: row.email ? String(row.email) : null,
    role: row.role as UserRole,
    verification_status: row.verification_status as VerificationStatus,
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAuthenticatedUser(locals?: App.Locals): Promise<AuthIdentity | null> {
  return identityFromLocals(locals);
}

export async function getCurrentUser(locals?: App.Locals): Promise<CurrentUser | null> {
  const identity = identityFromLocals(locals);
  if (!identity) return null;

  const profile = await getUserProfile(identity.id);
  const userFromLocals = locals?.user as Parameters<typeof isPlatformAdmin>[0] | undefined;
  const admin = userFromLocals ? await isPlatformAdmin(userFromLocals) : env.DEMO_MODE;

  return {
    id: identity.id,
    role: profile?.role ?? "student",
    email: identity.email ?? profile?.email ?? "",
    verificationStatus: profile?.verification_status ?? "active",
    isAdmin: admin,
  };
}

export function getCurrentDevUser(): CurrentUser | null {
  if (!env.DEMO_MODE) return null;
  return {
    id: "user-student-demo",
    role: "student",
    email: "student@tranphu.edu.vn",
    verificationStatus: "active",
    isAdmin: true,
  };
}
