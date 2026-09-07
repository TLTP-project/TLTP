import type { UserRole } from "@/types";

export interface DemoUser {
  id: string;
  role: UserRole;
  email: string;
}

export function getCurrentDevUser(): DemoUser | null {
  const demoEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (!demoEnabled) return null;

  return {
    id: "user-student-demo",
    role: "student",
    email: "student@tranphu.edu.vn",
  };
}
