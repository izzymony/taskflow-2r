import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "./schema";
import { env } from "../config/env";

const config = env.database;

const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl,
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

export async function verifyConnection(): Promise<void> {
  await pool.query("SELECT 1");
}
