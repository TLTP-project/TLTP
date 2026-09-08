import { describe, it, expect } from "vitest";
import { checkUserQuota, submissionInputSchema } from "@/features/submissions";
import { validateSubmissionText, checkRateLimit } from "@/lib/security";

describe("Submissions & Security Validation", () => {
  it("enforces character limit (10 to 1,500 characters)", () => {
    const tooShort = validateSubmissionText("Ngắn");
    expect(tooShort.valid).toBe(false);

    const valid = validateSubmissionText("Em thấy phòng tin học cần nâng cấp thêm máy tính mới.");
    expect(valid.valid).toBe(true);

    const tooLong = validateSubmissionText("A".repeat(1501));
    expect(tooLong.valid).toBe(false);
  });

  it("validates submission input schema with Zod", () => {
    const valid = submissionInputSchema.safeParse({
      role: "student",
      target: "Thầy Nguyễn Văn A",
      text: "Nội dung phản hồi hợp lệ cho giáo viên.",
    });
    expect(valid.success).toBe(true);

    const invalidRole = submissionInputSchema.safeParse({
      role: "unknown_role",
      target: "Nhà trường",
      text: "Nội dung phản hồi hợp lệ.",
    });
    expect(invalidRole.success).toBe(false);
  });

  it("throttles excessive requests using in-memory rate limiter", () => {
    const testKey = `test_ip_${Date.now()}`;
    // Limit to 2 requests in 60 seconds
    const first = checkRateLimit(testKey, 2, 60);
    expect(first.allowed).toBe(true);

    const second = checkRateLimit(testKey, 2, 60);
    expect(second.allowed).toBe(true);

    const third = checkRateLimit(testKey, 2, 60);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("does not apply the daily submission quota to administrators", async () => {
    const quota = await checkUserQuota("admin-test-user", true);
    expect(quota.can_submit).toBe(true);
    expect(quota.reason).toBeUndefined();
  });
});
