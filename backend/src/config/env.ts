import { parseDatabaseUrl } from "./database";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

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
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 8000),
  databaseUrl,
  database: parseDatabaseUrl(databaseUrl),
  jwtSecret: readRequired("JWT_SECRET"),
  allowedOrigins: readList("ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS),
};
