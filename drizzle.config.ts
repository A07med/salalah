import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const migrationUrl =
  process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./supabase/migrations",
  ...(migrationUrl ? { dbCredentials: { url: migrationUrl } } : {}),
  strict: true,
  verbose: true,
});
