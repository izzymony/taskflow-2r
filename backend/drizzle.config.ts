import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
import { parseDatabaseUrl, toMysqlUrl } from "./src/config/database";

// .env holds the shared/production settings, .env.local the local overrides.
// An explicit `bun --env-file=...` wins, so only fall back to loading the files
// when DATABASE_URL has not been provided by the environment.
if (!process.env.DATABASE_URL) {
  loadEnv({ path: ".env" });
  loadEnv({ path: ".env.local", override: true });
}

const database = parseDatabaseUrl(process.env.DATABASE_URL ?? "");

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: toMysqlUrl(database),
    ...(database.ssl ? { ssl: database.ssl } : {}),
  },
});
