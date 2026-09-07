import { NextRequest, NextResponse } from "next/server";
import { submitFeedback, checkUserQuota } from "@/features/submissions";
import { getCurrentUser } from "@/features/auth";
import { checkPersistentRateLimit, hashClientIp } from "@/lib/security";
import type { CreateSubmissionInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Global IP rate limit: 5 submissions per 10 minutes
    const rateLimitKey = hashClientIp(clientIp) || "unknown-ip";
    const rateLimit = await checkPersistentRateLimit(`submit_ip_${rateLimitKey}`, 5, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau ít phút.",
          retryAfterSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as CreateSubmissionInput;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để gửi phản hồi." },
        { status: 401 }
      );
    }

    // Enforce role strictly from the authenticated user's profile
    // Users cannot self-grant or elevate roles in the request payload
    const submissionPayload: CreateSubmissionInput = {
      ...body,
      role: user.role,
    };

    const result = await submitFeedback(
      user.id,
      submissionPayload,
      clientIp,
      request.headers.get("user-agent") || undefined
    );

    if (!result.success) {
      const statusCode =
        result.reason === "QUOTA_EXCEEDED"
          ? 403
          : result.reason === "SECURITY_FAILED"
          ? 400
          : result.reason === "PROCESSING_FAILED"
          ? 503
          : 422; // Off-topic / unprocessable

      return NextResponse.json(
        {
          error: result.error,
          reason: result.reason,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      post: result.post,
    });
  } catch (error) {
    console.error("API /api/submissions POST error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ trong quá trình xử lý phản hồi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để xem hạn mức gửi bài." },
      { status: 401 }
    );
  }

  const quota = await checkUserQuota(user.id);
  return NextResponse.json({ quota, role: user.role });
}
