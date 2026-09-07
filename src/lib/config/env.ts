import { z } from "zod";

const booleanEnv = z.preprocess((value) => {
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value;
}, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().default(""),
  BETTER_AUTH_SECRET: z.string().default("development-only-better-auth-secret-change-me"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-5.6-luna"),
  OPENAI_REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("high"),
  OPENAI_STORE: booleanEnv.default(false),
  OPENAI_MAX_OUTPUT_TOKENS: z.coerce.number().default(1200),
  PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().default(""),
  TURNSTILE_SECRET_KEY: z.string().optional().default(""),
  DEMO_MODE: booleanEnv.default(process.env.NODE_ENV !== "production"),
  ADMIN_USER_IDS: z.string().optional().default(""),
  ADMIN_GITHUB_LOGINS: z.string().optional().default(""),
  IP_HASH_SALT: z.string().optional().default("development-only-ip-salt"),
  RAW_DATA_RETENTION_DAYS: z.coerce.number().default(90),
  GITHUB_CLIENT_ID: z.string().optional().default(""),
  GITHUB_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

function read(name: string, legacyName?: string): string | undefined {
  return process.env[name] ?? (legacyName ? process.env[legacyName] : undefined);
}

function parseEnv(): Env {
  const parsed = envSchema.safeParse({
    DATABASE_URL: read("DATABASE_URL"),
    BETTER_AUTH_SECRET: read("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: read("BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL"),
    OPENAI_API_KEY: read("OPENAI_API_KEY"),
    OPENAI_MODEL: read("OPENAI_MODEL"),
    OPENAI_REASONING_EFFORT: read("OPENAI_REASONING_EFFORT"),
    OPENAI_STORE: read("OPENAI_STORE"),
    OPENAI_MAX_OUTPUT_TOKENS: read("OPENAI_MAX_OUTPUT_TOKENS"),
    PUBLIC_TURNSTILE_SITE_KEY: read("PUBLIC_TURNSTILE_SITE_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
    TURNSTILE_SECRET_KEY: read("TURNSTILE_SECRET_KEY"),
    DEMO_MODE: read("DEMO_MODE", "NEXT_PUBLIC_DEMO_MODE"),
    ADMIN_USER_IDS: read("ADMIN_USER_IDS"),
    ADMIN_GITHUB_LOGINS: read("ADMIN_GITHUB_LOGINS"),
    IP_HASH_SALT: read("IP_HASH_SALT"),
    RAW_DATA_RETENTION_DAYS: read("RAW_DATA_RETENTION_DAYS"),
    GITHUB_CLIENT_ID: read("GITHUB_CLIENT_ID"),
    GITHUB_CLIENT_SECRET: read("GITHUB_CLIENT_SECRET"),
    GOOGLE_CLIENT_ID: read("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: read("GOOGLE_CLIENT_SECRET"),
  });

  if (!parsed.success) {
    console.warn("Invalid environment variables:", parsed.error.format());
    return envSchema.parse({});
  }

  return parsed.data;
}

export const env = parseEnv();
