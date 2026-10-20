import dotenv from "dotenv";
import path from "path";

// 1. Determine environment type
const isProd = process.env.NODE_ENV === "production";

// 2. Load the precise file path relative to your backend root folder
dotenv.config({
  path: isProd 
    ? path.resolve(process.cwd(), ".env")       // Live Production
    : path.resolve(process.cwd(), ".env.local") // Local Dev Terminal
});

// 3. Helper function to enforce strictly required keys
function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`❌ Missing critical environment variable: ${name}. Please check your .env configuration.`);
  }
  return value;
}

// 4. Export a centralized, strongly-typed configuration object
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  
  // Strict variables (Throws instant actionable error if empty)
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  JWT_SECRET: process.env.JWT_SECRET || "fallback_local_secret",
};
