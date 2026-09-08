import OpenAI from "openai";
import { env } from "@/lib/config/env";
import type { AiRewriteResult } from "@/types";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || "dummy-key-for-scaffold",
});

/**
 * Structured Output JSON Schema for GPT-5.6 Luna Responses API
 */
export function buildLunaResponseSchema() {
  return {
  type: "json_schema" as const,
  name: "feedback_rewrite_decision",
  strict: true,
  schema: {
    type: "object",
    properties: {
      decision: {
        type: "string",
        enum: ["publish", "nothing"],
        description: "Whether the feedback is relevant and should be published ('publish') or off-topic/not feedback ('nothing').",
      },
      public_text: {
        type: ["string", "null"],
        description: "The rewritten polite, constructive feedback. Null if decision is 'nothing'.",
      },
      teacher_name: {
        type: ["string", "null"],
        description: "The teacher name explicitly identified in the student's original feedback, preserving the [[TARGET_TEACHER]] placeholder when present; null when no teacher can be identified or the sender is not a student.",
      },
      meaning_preserved: {
        type: "boolean",
        description: "True if the core message and sentiment were preserved while softening tone.",
      },
      reasoning_notes: {
        type: "string",
        description: "Brief internal classification note for audit logs.",
      },
    },
    required: ["decision", "public_text", "teacher_name", "meaning_preserved", "reasoning_notes"],
    additionalProperties: false,
  },
  };
}

export const lunaResponseSchema = buildLunaResponseSchema();

/**
 * Calls GPT-5.6 Luna via the Responses API.
 * Uses structured output formatting and reasoning effort from configuration.
 */
export async function callLunaRewrite(
  prompt: string,
): Promise<AiRewriteResult> {
  // The local demo can run without a key, but production must never silently
  // publish a simulated AI response.
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "dummy-key-for-scaffold") {
    if (!env.DEMO_MODE) {
      throw new Error("OPENAI_API_KEY is required when demo mode is disabled.");
    }

    return simulateDevelopmentLunaRewrite(prompt);
  }

  try {
    // Standard Responses API call
    // Note: If using official SDK with responses.create
    const response = await openai.responses.create({
      model: env.OPENAI_MODEL,
      reasoning: { effort: env.OPENAI_REASONING_EFFORT },
      input: prompt,
      max_output_tokens: env.OPENAI_MAX_OUTPUT_TOKENS,
      text: { format: buildLunaResponseSchema() },
      store: env.OPENAI_STORE,
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("Empty response from Luna Responses API");
    }

    const parsed = JSON.parse(content) as AiRewriteResult;
    return {
      decision: parsed.decision,
      public_text: parsed.public_text,
      teacher_name: parsed.teacher_name ?? null,
      meaning_preserved: parsed.meaning_preserved ?? true,
      reasoning_notes: parsed.reasoning_notes,
    };
  } catch (error) {
    console.error("OpenAI Luna call failed:", error);
    // Return technical failure state as required by PLAN.md
    throw error;
  }
}

/**
 * Deterministic local simulation for dev & testing without live API keys
 */
export function simulateDevelopmentLunaRewrite(prompt: string): AiRewriteResult {
  // Extract submitted text section to avoid matching prompt instruction keywords
  const submittedSection = prompt.includes('"""')
    ? prompt.split('"""')[1] || prompt
    : prompt;

  const textLower = submittedSection.toLowerCase();
  const isOffTopic =
    textLower.includes("off-topic") ||
    textLower.includes("không liên quan") ||
    textLower.includes("spam-test");

  if (isOffTopic) {
    return {
      decision: "nothing",
      public_text: null,
      teacher_name: null,
      meaning_preserved: true,
      reasoning_notes: "Classified as off-topic in local simulation.",
    };
  }

  const hasTeacherPlaceholder = prompt.includes("[[TARGET_TEACHER]]");
  const targetRef = hasTeacherPlaceholder ? "[[TARGET_TEACHER]]" : "thầy/cô";

  return {
    decision: "publish",
    public_text: `Em cảm thấy bài giảng của ${targetRef} còn hơi nhanh nên mong thầy/cô có thể giải thích chi tiết hơn và cho thêm ví dụ minh họa để chúng em dễ tiếp thu bài học.`,
    teacher_name: hasTeacherPlaceholder ? "[[TARGET_TEACHER]]" : null,
    meaning_preserved: true,
    reasoning_notes: "Successfully rewritten with constructive tone.",
  };
}
