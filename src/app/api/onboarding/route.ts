import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/features/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const roleSchema = z.object({ role: z.enum(["student", "teacher", "school"]) });

export async function POST(request: NextRequest) {
  try {
    const identity = await getAuthenticatedUser();
    if (!identity) {
      return NextResponse.json({ error: "Vui lòng đăng nhập trước khi chọn vai trò." }, { status: 401 });
    }

    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Vai trò không hợp lệ." }, { status: 422 });
    }

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production") {
      return NextResponse.json({ success: true, role: parsed.data.role });
    }

    const supabase = await createServerSupabaseClient();
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("user_id", identity.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.verification_status === "active") {
      return NextResponse.json({ error: "Tài khoản đã có vai trò được kích hoạt." }, { status: 409 });
    }

    const verificationStatus = parsed.data.role === "student" ? "active" : "pending_verification";
    const { error } = await supabase.from("profiles").upsert({
      user_id: identity.id,
      email: identity.email,
      role: parsed.data.role,
      verification_status: verificationStatus,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, role: parsed.data.role });
  } catch (error) {
    console.error("API /api/onboarding POST error:", error);
    return NextResponse.json({ error: "Không thể lưu vai trò lúc này." }, { status: 500 });
  }
}
