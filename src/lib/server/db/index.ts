import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "$lib/config/env";
import { schema } from "./schema";

// A placeholder keeps SvelteKit's build phase import-safe. Any real database
// operation calls assertDatabaseConfigured first when demo mode is disabled.
const connectionString = env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";
export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export function assertDatabaseConfigured(): void {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Neon database operations.");
  }
}

export type Database = typeof db;
