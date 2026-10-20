import mysql from "mysql2/promise";
import { parseDatabaseUrl } from "../src/config/database";

const rawUrl = process.env.DATABASE_URL?.trim();

if (!rawUrl) {
  console.error("DATABASE_URL is not set. Add it to backend/.env or backend/.env.local.");
  process.exit(1);
}

let config: ReturnType<typeof parseDatabaseUrl>;
try {
  config = parseDatabaseUrl(rawUrl);
} catch (error) {
  console.error(`✗ Could not parse DATABASE_URL: ${(error as Error).message}`);
  process.exit(1);
}

console.log("Parsed connection target");
console.log(`  host     ${config.host}:${config.port}`);
console.log(`  database ${config.database}`);
console.log(`  user     ${config.user}`);
console.log(`  ssl      ${config.ssl ? `enabled (rejectUnauthorized: ${config.ssl.rejectUnauthorized})` : "disabled"}`);

const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT ?? 20000),
});

try {
  await pool.query("SELECT 1");
  console.log("✓ Connection succeeded");
} catch (error) {
  console.error(`✗ Connection failed: ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
