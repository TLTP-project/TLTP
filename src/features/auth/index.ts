import type { UserRole, Profile, VerificationStatus } from "@/types";
import { env } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
  verificationStatus: VerificationStatus;
}

// In-memory profiles mock for local development and demonstration
const mockProfiles = new Map<string, Profile>([
  [
    "user-student-demo",
    {
      user_id: "user-student-demo",
      email: "student@tranphu.edu.vn",
      role: "student",
      verification_status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  [
    "user-teacher-demo",
    {
      user_id: "user-teacher-demo",
      email: "teacher@tranphu.edu.vn",
      role: "teacher",
      verification_status: "pending_verification",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
]);

/**
 * Handles role onboarding according to PLAN.md section 2:
 * - "Students can use the product immediately after choosing a role." (active)
 * - "Teacher and School accounts start as pending_verification."
 */
export async function onboardUserRole(
  userId: string,
  role: UserRole,
  email?: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  const existing = mockProfiles.get(userId);

  // If already onboarded, prevent self-granting a new role
  if (existing && existing.verification_status === "active") {
    return {
      success: false,
      error: "Tài khoản của bạn đã được xác thực vai trò và không thể tự thay đổi.",
    };
  }

  const verification_status: VerificationStatus =
    role === "student" ? "active" : "pending_verification";

  const newProfile: Profile = {
    user_id: userId,
    email: email || existing?.email || "user@tranphu.edu.vn",
    role,
    verification_status,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockProfiles.set(userId, newProfile);

  return {
    success: true,
    profile: newProfile,
  };
}

/**
 * Fetches user profile by ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  return mockProfiles.get(userId) || null;
}

/**
 * Returns the authenticated Supabase identity when production auth is enabled.
 * Local development keeps the deterministic demo identity so the UI can be
 * previewed without a Supabase project.
 */
export async function getAuthenticatedUser(): Promise<{ id: string; email: string | null } | null> {
  if (env.NEXT_PUBLIC_DEMO_MODE) {
    return {
      id: "user-student-demo",
      email: "student@tranphu.edu.vn",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    return { id: data.user.id, email: data.user.email ?? null };
  } catch (error) {
    console.error("Unable to resolve authenticated user:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const identity = await getAuthenticatedUser();
  if (!identity) return null;

  if (env.NEXT_PUBLIC_DEMO_MODE) {
    return {
      id: identity.id,
      role: "student",
      email: identity.email || "student@tranphu.edu.vn",
      verificationStatus: "active",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_id, email, role, verification_status, created_at, updated_at")
      .eq("user_id", identity.id)
      .maybeSingle();

    if (error || !profile) return null;

    return {
      id: identity.id,
      role: profile.role as UserRole,
      email: identity.email || profile.email || "",
      verificationStatus: profile.verification_status as VerificationStatus,
    };
  } catch (error) {
    console.error("Unable to load authenticated profile:", error);
    return null;
  }
}

/**
 * Legacy server helper retained for code that explicitly needs demo mode.
 */
export function getCurrentDevUser(): CurrentUser | null {
  if (!env.NEXT_PUBLIC_DEMO_MODE) return null;

  return {
    id: "user-student-demo",
    role: "student",
    email: "student@tranphu.edu.vn",
    verificationStatus: "active",
  };
}
