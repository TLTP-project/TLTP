import { createHash } from "node:crypto";
import { env } from "$lib/config/env";
import { sql } from "$lib/server/db";

export function hashClientIp(ip?: string): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${env.IP_HASH_SALT}:${ip}`).digest("hex");
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 5, windowSeconds = 600) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, resetInSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

/** Neon-backed limiter with an in-memory fallback when running demo mode. */
export async function checkPersistentRateLimit(key: string, maxRequests = 5, windowSeconds = 600) {
  if (env.DEMO_MODE || !env.DATABASE_URL) return checkRateLimit(key, maxRequests, windowSeconds);
  try {
    const rows = await sql`
      INSERT INTO rate_limits (key, count, reset_at, updated_at)
      VALUES (${key}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'), NOW())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at <= NOW() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= NOW() THEN NOW() + (${windowSeconds} * INTERVAL '1 second') ELSE rate_limits.reset_at END,
        updated_at = NOW()
      RETURNING count, GREATEST(0, EXTRACT(EPOCH FROM (reset_at - NOW()))) AS reset_seconds
    `;
    const row = rows[0] as { count: number; reset_seconds: number } | undefined;
    if (!row) throw new Error("Rate limit query returned no row");
    const count = Number(row.count);
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetInSeconds: Math.ceil(Number(row.reset_seconds) || windowSeconds),
    };
  } catch (error) {
    console.error("Durable rate limit unavailable; using local fallback:", error);
    return checkRateLimit(`fallback_${key}`, maxRequests, windowSeconds);
  }
}

export function validateSubmissionText(text: string) {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  if (charCount < 10) return { valid: false, error: "Nội dung phản hồi quá ngắn. Vui lòng chia sẻ ít nhất 10 ký tự.", charCount };
  if (charCount > 1500) return { valid: false, error: "Nội dung phản hồi vượt quá giới hạn tối đa 1,500 ký tự.", charCount };
  return { valid: true, charCount };
}

export async function verifyTurnstileToken(token?: string, ip?: string) {
  if (env.DEMO_MODE || process.env.NODE_ENV !== "production") return { success: true };
  if (!env.TURNSTILE_SECRET_KEY) return { success: false, error: "Dịch vụ chống bot chưa được cấu hình. Vui lòng thử lại sau." };
  if (!token) return { success: false, error: "Vui lòng hoàn thành xác thực chống bot (Turnstile)." };

  try {
    const formData = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    if (ip) formData.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json() as { success?: boolean };
    return data.success
      ? { success: true }
      : { success: false, error: "Xác thực chống bot không hợp lệ hoặc đã hết hạn." };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, error: "Không thể kết nối đến dịch vụ xác thực chống bot." };
  }
}
