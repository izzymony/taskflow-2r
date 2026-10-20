import { defineConfig } from 'drizzle-kit';

// ⚠️ REMOVED: import 'dotenv/config'; 
// This prevents the dotenv package from overwriting Bun's native --env-file selection flags.

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ Critical Error: DATABASE_URL is missing. " +
    "Ensure you are passing the correct file, e.g., 'bun --env-file=.env drizzle-kit push'"
  );
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // Forces the Drizzle Kit CLI binary to connect using strict secure TLS
    ssl: 'Amazon RDS', 
  },
});
