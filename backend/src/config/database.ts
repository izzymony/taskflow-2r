export interface DatabaseSslConfig {
  rejectUnauthorized: boolean;
  ca?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: DatabaseSslConfig | undefined;
}

const SSL_MODES_REQUIRING_TLS = new Set(["REQUIRED", "VERIFY_CA", "VERIFY_IDENTITY", "PREFERRED"]);

/**
 * Parses a MySQL connection string into discrete connection options.
 *
 * Handles the two formats providers hand out:
 *   mysql://user:password@host:3306/database
 *   jdbc:mysql://user:password@host:4000/database?ssl-mode=REQUIRED   (TiDB Cloud, JDBC)
 *
 * Query parameters are consumed here and never forwarded to mysql2, which
 * rejects unknown options (for example "ssl-mode").
 */
export function parseDatabaseUrl(rawUrl: string): DatabaseConfig {
  let url = rawUrl.trim();

  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1);
  }

  if (url.toLowerCase().startsWith("jdbc:")) {
    url = url.slice("jdbc:".length);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Expected mysql://user:password@host:port/database",
    );
  }

  if (parsed.protocol !== "mysql:") {
    throw new Error(
      `DATABASE_URL must use the mysql:// scheme (received "${parsed.protocol}//").`,
    );
  }

  const host = decodeURIComponent(parsed.hostname);
  const port = parsed.port ? Number(parsed.port) : 3306;
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

  if (!host) {
    throw new Error("DATABASE_URL is missing a host.");
  }
  if (!user) {
    throw new Error("DATABASE_URL is missing a username.");
  }
  if (!database) {
    throw new Error("DATABASE_URL is missing a database name.");
  }

  const sslMode = (parsed.searchParams.get("ssl-mode") ?? "").toUpperCase();
  const ca = parsed.searchParams.get("ssl-ca");

  let ssl: DatabaseSslConfig | undefined;
  if (SSL_MODES_REQUIRING_TLS.has(sslMode)) {
    ssl = {
      rejectUnauthorized: sslMode === "VERIFY_CA" || sslMode === "VERIFY_IDENTITY",
    };
    if (ca) {
      ssl.ca = ca;
    }
  }

  return { host, port, user, password, database, ssl };
}

/** Rebuilds a canonical mysql:// URL, used by drizzle-kit which expects a URL. */
export function toMysqlUrl(config: DatabaseConfig): string {
  const credentials = `${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}`;
  const auth = config.password ? `${credentials}@` : `${encodeURIComponent(config.user)}@`;
  return `mysql://${auth}${config.host}:${config.port}/${encodeURIComponent(config.database)}`;
}
