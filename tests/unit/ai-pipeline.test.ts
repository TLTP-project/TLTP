import { describe, it, expect } from "vitest";
import { buildLunaPrompt, processFeedbackWithLuna } from "@/features/ai";
import { TARGET_TEACHER_PLACEHOLDER } from "@/lib/privacy";

describe("AI Luna Pipeline", () => {
  it("constructs prompt following PLAN.md instructions", () => {
    const prompt = buildLunaPrompt({
      role: "student",
      target: "Thầy Nguyễn Văn A",
      hasTeacherTarget: true,
      sanitizedText: "Tiết học hơi khó hiểu",
    });

    expect(prompt).toContain("Trải Lòng Trần Phú");
    expect(prompt).toContain("Sender Role: student");
    expect(prompt).toContain(TARGET_TEACHER_PLACEHOLDER);
    expect(prompt).toContain("TONE SOFTENING");
    expect(prompt).toContain("Tiết học hơi khó hiểu");
  });

  it("handles off-topic submissions by returning nothing decision", async () => {
    const result = await processFeedbackWithLuna({
      role: "student",
      target: "Nhà trường",
      text: "Đây là nội dung off-topic spam không liên quan tới trường học.",
    });

    expect(result.decision).toBe("nothing");
    expect(result.publicText).toBeNull();
  });

  it("rewrites constructive feedback and preserves teacher name", async () => {
    const result = await processFeedbackWithLuna({
      role: "student",
      target: "Thầy Nguyễn Văn A",
      teacherName: "Thầy Nguyễn Văn A",
      text: "Thầy Nguyễn Văn A cho bài tập nhiều quá làm không kịp.",
    });

    expect(result.decision).toBe("publish");
    expect(result.publicText).toBeTruthy();
    expect(result.displaySender).toMatch(/^Student /);
    expect(result.displayTarget).toBe("Thầy Nguyễn Văn A");
  });
});
