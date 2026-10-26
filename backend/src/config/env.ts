import dotenv from "dotenv";
import path from "path";
import { parseDatabaseUrl } from "./database";

const isProd = process.env.NODE_ENV === "production";

// Load the environment file that matches the current environment.
// dotenv never overrides values already present in process.env, so platform
// provided variables (Render, CI) always win over the local file.
dotenv.config({
  path: isProd
    ? path.resolve(process.cwd(), ".env")
    : path.resolve(process.cwd(), ".env.local"),
});

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

function readList(name: string, fallback: string[]): string[] {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const databaseUrl = readRequired("DATABASE_URL");

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: isProd,
  port: Number(process.env.PORT ?? 8000),
  databaseUrl,
  database: parseDatabaseUrl(databaseUrl),
  jwtSecret: readRequired("JWT_SECRET"),
  allowedOrigins: readList("ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS),
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? (isProd ? "none" : "lax")) as
    | "none"
    | "lax"
    | "strict",
};
