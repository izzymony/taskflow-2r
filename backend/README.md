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
| `bun run db:generate` | Generate a migration from the Drizzle schema  |
| `bun run db:push`   | Push the schema straight to the database        |
| `bun run db:studio` | Open Drizzle Studio                            |

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
