import type { UserRole, Profile, VerificationStatus } from "@/types";

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
 * Mock helper to retrieve current active user in dev mode
 */
export function getCurrentDevUser(): { id: string; role: UserRole; email: string } {
  return {
    id: "user-student-demo",
    role: "student",
    email: "student@tranphu.edu.vn",
  };
}
