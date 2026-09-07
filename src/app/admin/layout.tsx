import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/reports");
  }

  if (!user.isAdmin) {
    redirect("/?error=admin_required");
  }

  return children;
}
