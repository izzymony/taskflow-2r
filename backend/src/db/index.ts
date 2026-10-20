import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "./schema";
import { env } from "../config/env";

const rawUrl = env.databaseUrl;
let connectionString = rawUrl;
let sslConfig: any = false;

try {
  const databaseUrl = new URL(rawUrl);
  const sslMode = databaseUrl.searchParams.get("ssl-mode")?.toUpperCase();
  databaseUrl.searchParams.delete("ssl-mode");

  if (sslMode === "REQUIRED") {
    sslConfig = { rejectUnauthorized: false };
  }
  connectionString = databaseUrl.toString();
} catch (error) {
  sslConfig = rawUrl.includes("ssl-mode=REQUIRED") ? { rejectUnauthorized: false } : false;
}

const pool = mysql.createPool({
  uri: connectionString,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

// 💡 WORKAROUND FOR 1.0.0-RC.4 BUG:
// Pass 'pool.pool' as the client so Drizzle's internal framework can find the '.config' property!
export const db = drizzle({
  client: (pool as any).pool ?? pool,
  relations: relations,
});
