import { env } from "@/lib/config/env";
import { createAdminClient } from "@/lib/db";
import { createHash } from "node:crypto";

export function hashClientIp(ip?: string): string | null {
  if (!ip) return null;

  return createHash("sha256")
    .update(`${env.IP_HASH_SALT}:${ip}`)
    .digest("hex");
}

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Checks in-memory sliding window rate limit.
 * Used for IP-based and user-based request throttling.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowSeconds: number = 600 // 10 minutes default
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (entry.count >= maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  entry.count += 1;
  const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSeconds,
  };
}

/**
 * Uses Supabase as a durable limiter in production and keeps the in-memory
 * limiter as a best-effort fallback for local development or DB outages.
 */
export async function checkPersistentRateLimit(
  key: string,
  maxRequests: number = 5,
  windowSeconds: number = 600
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
  if (env.NEXT_PUBLIC_DEMO_MODE) {
    return checkRateLimit(key, maxRequests, windowSeconds);
  }

  try {
    const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
      p_key: key,
      p_limit: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error || !data) throw error || new Error("Empty rate limit response");

    return {
      allowed: Boolean(data.allowed),
      remaining: Number(data.remaining) || 0,
      resetInSeconds: Number(data.reset_in_seconds) || windowSeconds,
    };
  } catch (error) {
    console.error("Durable rate limit unavailable; using local fallback:", error);
    return checkRateLimit(`fallback_${key}`, maxRequests, windowSeconds);
  }
}

/**
 * Validates text length according to PLAN.md section 7:
 * "Body length is limited to approximately 1,000–1,500 characters."
 */
export function validateSubmissionText(text: string): {
  valid: boolean;
  error?: string;
  charCount: number;
} {
  const trimmed = text.trim();
  const charCount = trimmed.length;

  if (charCount < 10) {
    return {
      valid: false,
      error: "Nội dung phản hồi quá ngắn. Vui lòng chia sẻ ít nhất 10 ký tự.",
      charCount,
    };
  }

  if (charCount > 1500) {
    return {
      valid: false,
      error: "Nội dung phản hồi vượt quá giới hạn tối đa 1,500 ký tự.",
      charCount,
    };
  }

  return { valid: true, charCount };
}

/**
 * Verifies Cloudflare Turnstile token.
 * Passes automatically in development or if TURNSTILE_SECRET_KEY is omitted.
 */
export async function verifyTurnstileToken(
  token?: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (env.NEXT_PUBLIC_DEMO_MODE || process.env.NODE_ENV !== "production") {
    // Development and tests intentionally bypass the external challenge.
    return { success: true };
  }

  if (!env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET_KEY === "dummy-secret-key") {
    return {
      success: false,
      error: "Dịch vụ chống bot chưa được cấu hình. Vui lòng thử lại sau.",
    };
  }

  if (!token) {
    return {
      success: false,
      error: "Vui lòng hoàn thành xác thực chống bot (Turnstile).",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: "Xác thực chống bot không hợp lệ hoặc đã hết hạn.",
    };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return {
      success: false,
      error: "Không thể kết nối đến dịch vụ xác thực chống bot.",
    };
  }
}
