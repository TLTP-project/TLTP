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
    expect(prompt).toContain("Student → Teacher");
    expect(prompt).toContain("Tiết học hơi khó hiểu");
  });

  it("keeps teacher and school feedback anonymous toward the generic student target", () => {
    const prompt = buildLunaPrompt({
      role: "school",
      target: "Học sinh / lớp học",
      hasTeacherTarget: false,
      sanitizedText: "Mong các bạn có thêm không gian học tập yên tĩnh.",
    });

    expect(prompt).toContain("Teacher/School → Student or class");
    expect(prompt).toContain("Học sinh / lớp học");
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
      teachers: [{
        id: "11111111-1111-1111-1111-111111111111",
        display_name: "Thầy Nguyễn Văn A",
        subject: "Toán học",
        active: true,
        created_at: new Date().toISOString(),
      }],
      text: "Thầy Nguyễn Văn A cho bài tập nhiều quá làm không kịp.",
    });

    expect(result.decision).toBe("publish");
    expect(result.publicText).toBeTruthy();
    expect(result.displaySender).toMatch(/^Student /);
    expect(result.displayTarget).toBe("Thầy Nguyễn Văn A");
    expect(result.targetTeacherId).toBe("11111111-1111-1111-1111-111111111111");
  });
});
