import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().default("placeholder-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default("placeholder-service-key"),

  // OpenAI Luna
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-5.6-luna"),
  OPENAI_REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("high"),
  OPENAI_STORE: z.coerce.boolean().default(false),
  OPENAI_MAX_OUTPUT_TOKENS: z.coerce.number().default(1200),

  // Anti-abuse
  TURNSTILE_SITE_KEY: z.string().optional().default(""),
  TURNSTILE_SECRET_KEY: z.string().optional().default(""),

  // Application
  ADMIN_USER_IDS: z.string().optional().default(""),
  RAW_DATA_RETENTION_DAYS: z.coerce.number().default(90),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_REASONING_EFFORT: process.env.OPENAI_REASONING_EFFORT,
    OPENAI_STORE: process.env.OPENAI_STORE,
    OPENAI_MAX_OUTPUT_TOKENS: process.env.OPENAI_MAX_OUTPUT_TOKENS,
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    ADMIN_USER_IDS: process.env.ADMIN_USER_IDS,
    RAW_DATA_RETENTION_DAYS: process.env.RAW_DATA_RETENTION_DAYS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    console.warn("Invalid environment variables:", parsed.error.format());
    // Fall back to defaults
    return envSchema.parse({});
  }

  return parsed.data;
}

export const env = parseEnv();
