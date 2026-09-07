import { describe, it, expect } from "vitest";
import {
  generateAnonymousAlias,
  redactPII,
  replaceTargetWithPlaceholder,
  restoreTargetPlaceholder,
  TARGET_TEACHER_PLACEHOLDER,
} from "@/lib/privacy";

describe("Privacy Engine", () => {
  it("generates role-appropriate aliases", () => {
    const studentAlias = generateAnonymousAlias("student");
    expect(studentAlias).toMatch(/^Student /);

    const teacherAlias = generateAnonymousAlias("teacher");
    expect(teacherAlias).toMatch(/^Teacher /);

    const schoolAlias = generateAnonymousAlias("school");
    expect(schoolAlias).toBe("School");
  });

  it("redacts sensitive PII while keeping text structure", () => {
    const raw = "Liên hệ em qua email test.student@gmail.com hoặc số 0912345678, MSHS: 12345, IG: @student_xyz";
    const redacted = redactPII(raw);

    expect(redacted).toContain("[EMAIL REDACTED]");
    expect(redacted).toContain("[PHONE REDACTED]");
    expect(redacted).toContain("[STUDENT ID REDACTED]");
    expect(redacted).toContain("[HANDLE REDACTED]");
    expect(redacted).not.toContain("test.student@gmail.com");
    expect(redacted).not.toContain("0912345678");
  });

  it("replaces and restores target teacher placeholder correctly", () => {
    const teacherName = "Thầy Nguyễn Văn A";
    const userText = "Em thấy Thầy Nguyễn Văn A giảng bài hơi nhanh.";

    const withPlaceholder = replaceTargetWithPlaceholder(userText, teacherName);
    expect(withPlaceholder).toContain(TARGET_TEACHER_PLACEHOLDER);
    expect(withPlaceholder).not.toContain(teacherName);

    const rewrittenByAi = `Mong ${TARGET_TEACHER_PLACEHOLDER} có thể giảng chậm hơn một chút ạ.`;
    const restored = restoreTargetPlaceholder(rewrittenByAi, teacherName);

    expect(restored).toContain(teacherName);
    expect(restored).not.toContain(TARGET_TEACHER_PLACEHOLDER);
  });
});
