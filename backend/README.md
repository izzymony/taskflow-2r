# Taskflow API

Express 5 + Drizzle ORM (MySQL) backend for Taskflow, run on [Bun](https://bun.com).

## Layout

```
backend/
├── drizzle/            # Generated SQL migrations + snapshots
├── src/
│   ├── config/         # Environment parsing/validation (env.ts)
│   ├── controllers/    # HTTP handlers (thin: parse -> service -> respond)
│   ├── db/             # Drizzle client and schema
│   ├── middleware/     # Auth guard, request validation, error handler
│   ├── routes/         # Express routers mounted in server.ts
│   ├── services/       # Business logic and database access
│   ├── validators/     # Zod schemas used by the request validator
│   └── server.ts       # Application entrypoint
├── .env.example
├── drizzle.config.ts
└── package.json
```

## Getting started

```bash
bun install
cp .env.example .env.local   # then fill in DATABASE_URL and JWT_SECRET
bun run dev                  # http://localhost:8000
```

Bun loads `.env` and `.env.local` automatically. `DATABASE_URL` and `JWT_SECRET` are
required — the server refuses to boot without them.

## Scripts

| Script              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `bun run dev`       | Start the API with hot reload                   |
| `bun run start`     | Start the API in production mode                |
| `bun run typecheck` | Type-check the project with `tsc --noEmit`      |
| `bun run db:check`  | Show the parsed connection target and test it   |
| `bun run db:generate` | Generate a migration from the Drizzle schema  |
| `bun run db:push`   | Push the schema to the local database           |
| `bun run db:push:live` | Push the schema to the database in `.env`    |
| `bun run db:studio` | Open Drizzle Studio                            |

## Database connection

`DATABASE_URL` accepts both formats:

```
mysql://user:password@host:3306/database
jdbc:mysql://user:password@host:4000/database?ssl-mode=REQUIRED
```

The `jdbc:` prefix (TiDB Cloud, JDBC) is normalised away, and `ssl-mode` is turned
into the driver's TLS option instead of being passed through as an unknown
connection option. `src/config/database.ts` owns that parsing and validates the
result, so a malformed URL fails immediately with a readable message.

Check what the API resolves to, and that it can reach the server:

```bash
bun run db:check                      # uses .env.local
bun --env-file=.env scripts/check-db.ts   # uses the live database
```

The script prints the target (never the password) and whether the connection works.

## Environment variables

| Variable           | Required | Description                                       |
| ------------------ | -------- | ------------------------------------------------- |
| `DATABASE_URL`     | yes      | MySQL connection string                           |
| `JWT_SECRET`       | yes      | HS256 signing secret for access tokens            |
| `PORT`             | no       | API port (default `8000`)                         |
| `ALLOWED_ORIGINS`  | no       | Comma separated CORS origins (default `:3000,:3001`) |
| `NODE_ENV`         | no       | `production` enables secure cookies              |

## Endpoints

| Method | Path                | Auth | Description        |
| ------ | ------------------- | ---- | ------------------ |
| POST   | `/api/auth/signup`  | no   | Create an account  |
| POST   | `/api/auth/register`| no   | Alias of `/signup` |
| POST   | `/api/auth/login`   | no   | Log in, sets httpOnly cookies |
| GET    | `/api/profile`      | yes  | Current user profile |
| GET    | `/api/tasks`        | yes  | List tasks         |
| POST   | `/api/tasks`        | yes  | Create a task      |
| GET    | `/api/health`       | no   | Health check      |
