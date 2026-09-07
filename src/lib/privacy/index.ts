import type { UserRole } from "@/types";

const STUDENT_ALIASES = [
  "Student meow meow",
  "Student woof woof",
  "Student chirpy",
  "Student duckling",
  "Student bunny",
  "Student otter",
  "Student panda",
  "Student koala",
  "Student dolphin",
  "Student penguin",
  "Student hedgehog",
  "Student fox",
  "Student sparrow",
  "Student robin",
  "Student squirrel",
  "Student kitten",
  "Student puppy",
  "Student deer",
  "Student owl",
  "Student bear",
];

const TEACHER_ALIASES = [
  "Teacher chirp chirp",
  "Teacher gentle owl",
  "Teacher starry",
  "Teacher robin",
  "Teacher sparrow",
  "Teacher calm sea",
  "Teacher autumn leaf",
  "Teacher spring breeze",
  "Teacher morning sun",
  "Teacher green pine",
];

export const TARGET_TEACHER_PLACEHOLDER = "[[TARGET_TEACHER]]";

const VIETNAMESE_SURNAMES =
  "Nguyễn|Trần|Lê|Phạm|Hoàng|Vũ|Võ|Đặng|Bùi|Đỗ|Ngô|Dương|Lý|Huỳnh|Phan|Mai|Tạ|Đinh|Cao|Tô|Hồ|Trương|Lương|Đào|Đoàn|Hà|Phùng|Quách|Châu|Tôn|Thái|Kiều|Chung";
const VIETNAMESE_NAME_PART = "[A-ZÀ-Ỵ][a-zà-ỹ]+";

/**
 * Generates an anonymous alias for display.
 * Changes per post to prevent cross-post tracking.
 */
export function generateAnonymousAlias(role: UserRole): string {
  if (role === "school") {
    return "School";
  }

  if (role === "teacher") {
    const index = Math.floor(Math.random() * TEACHER_ALIASES.length);
    return TEACHER_ALIASES[index];
  }

  const index = Math.floor(Math.random() * STUDENT_ALIASES.length);
  return STUDENT_ALIASES[index];
}

/**
 * Replaces the canonical target teacher name with a safe placeholder
 * before passing to the AI model.
 */
export function replaceTargetWithPlaceholder(text: string, teacherName: string): string {
  if (!teacherName || !teacherName.trim()) {
    return text;
  }
  // Escape special regex characters
  const escaped = teacherName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  return text.replace(regex, TARGET_TEACHER_PLACEHOLDER);
}

/**
 * Restores the canonical teacher name from the placeholder
 * in the AI's processed output.
 */
export function restoreTargetPlaceholder(text: string, teacherName: string): string {
  if (!text) return text;
  return text.replaceAll(TARGET_TEACHER_PLACEHOLDER, teacherName);
}

/**
 * Redacts common PII (phone numbers, emails, student IDs)
 * while preserving educational context.
 */
export function redactPII(text: string): string {
  if (!text) return text;

  // Email regex
  let result = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    "[EMAIL REDACTED]"
  );

  // Phone numbers (VN formats: 09x, 08x, 03x, 07x, 05x, +84)
  result = result.replace(
    /(?:\+84|0)(?:3|5|7|8|9)[0-9]{8}\b/g,
    "[PHONE REDACTED]"
  );

  // General phone number pattern with spaces or dashes
  result = result.replace(
    /\b0\d{2,3}[-.\s]?\d{3}[-.\s]?\d{3,4}\b/g,
    "[PHONE REDACTED]"
  );

  // Student IDs (common formats like HS12345, 20241234, etc.)
  result = result.replace(
    /\b(?:MSHS|MSSV|HS|SV)[\s#:]*([0-9]{4,10})\b/gi,
    "[STUDENT ID REDACTED]"
  );

  // Social media handles (@username)
  result = result.replace(
    /(?<!\w)@([a-zA-Z0-9_]{3,30})\b/g,
    "[HANDLE REDACTED]"
  );

  return result;
}

/**
 * Masks likely Vietnamese person names while preserving the canonical teacher
 * placeholder. This is intentionally conservative and complements, rather
 * than replaces, the model's identity-redaction instructions.
 */
export function redactPotentialNames(text: string): string {
  if (!text) return text;

  const prefixedName = new RegExp(
    `\\b(?:bạn|em|anh|chị|thầy|cô|ông|bà)\\s+(?:${VIETNAMESE_SURNAMES})\\s+${VIETNAMESE_NAME_PART}(?:\\s+${VIETNAMESE_NAME_PART})?\\b`,
    "giu"
  );
  const standaloneName = new RegExp(
    `\\b(?:${VIETNAMESE_SURNAMES})\\s+${VIETNAMESE_NAME_PART}(?:\\s+${VIETNAMESE_NAME_PART})?\\b`,
    "gu"
  );

  return text
    .replace(prefixedName, "[PERSON REDACTED]")
    .replace(standaloneName, "[PERSON REDACTED]");
}
