import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "../db/schema";
import { sql } from "drizzle-orm";
import { env } from "../config/env";

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.database,
  ssl: env.database.ssl,
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

const result = await db.execute(sql`
  SELECT
    DATABASE() AS database_name,
    @@hostname AS database_host,
    @@session.time_zone AS session_timezone
`);

console.log(result);
