# Taskflow

Tasks, clients, conversations, and company knowledge in one workspace.

A monorepo with two independently runnable packages:

| Package           | Stack                                   | Dev URL                 |
| ----------------- | --------------------------------------- | ----------------------- |
| `frontend/`       | Next.js 16 (App Router), React 19, Tailwind 4 | http://localhost:3000 |
| `backend/`        | Express 5, Drizzle ORM (MySQL), Bun 1.4 | http://localhost:8000 |

## Repository layout

```
taskflow/
├── frontend/                  # Next.js application
│   ├── app/                   # App Router routes (signin, signup, tasks, chat, ...)
│   ├── components/            # Feature components + components/ui (shadcn)
│   ├── lib/
│   │   ├── api/               # API client (client.ts, auth.ts, tasks.ts)
│   │   ├── types/             # Shared frontend types
│   │   └── utils.ts           # cn() helper
│   ├── public/
│   ├── .env.example
│   └── package.json
├── backend/                   # Express API
│   ├── drizzle/               # Generated migrations
│   ├── src/
│   │   ├── config/            # Environment parsing and validation
│   │   ├── controllers/       # HTTP handlers
│   │   ├── db/                # Drizzle client and schema
│   │   ├── middleware/        # Auth guard, validation, error handler
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic and database access
│   │   ├── validators/        # Zod request schemas
│   │   └── server.ts          # Entry point
│   ├── .env.example
│   └── package.json
├── .github/workflows/ci.yml
└── package.json               # Convenience scripts for both packages
```

Each package keeps its own toolchain and lockfile: the frontend uses **pnpm** and the
API uses **bun**. They are deployed independently.

## Getting started

Prerequisites: [Node.js 20+](https://nodejs.org), [pnpm](https://pnpm.io),
[Bun](https://bun.com), and a MySQL database.

### Backend

```bash
cd backend
bun install
cp .env.example .env.local     # fill in DATABASE_URL and JWT_SECRET
bun run db:push                # create the schema
bun run dev                    # http://localhost:8000
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL
pnpm dev                       # http://localhost:3000
```

Both dev servers can be started from the repository root:

```bash
npm run dev:backend
npm run dev:frontend
```

## Environment variables

`backend/.env.local` (required — the API refuses to boot without them):

| Variable          | Description                                        |
| ----------------- | -------------------------------------------------- |
| `DATABASE_URL`    | MySQL connection string                            |
| `JWT_SECRET`      | HS256 signing secret for access tokens             |
| `PORT`            | API port (default `8000`)                          |
| `ALLOWED_ORIGINS` | Comma separated CORS origins (default `:3000,:3001`) |

`frontend/.env.local`:

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Base URL of the API (default `http://localhost:8000`) |

`.env` and `.env.local` are git-ignored; only `.env.example` files are committed.

## API

Base URL `http://localhost:8000`. See [`backend/README.md`](backend/README.md) for the
full endpoint table.

| Method | Path                | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| POST   | `/api/auth/signup`  | no   | Create an account        |
| POST   | `/api/auth/login`   | no   | Log in (sets httpOnly cookies) |
| GET    | `/api/profile`      | yes  | Current user profile     |
| GET    | `/api/tasks`        | yes  | List tasks               |
| POST   | `/api/tasks`        | yes  | Create a task            |
| GET    | `/api/health`       | no   | Health check             |

The frontend talks to the API through `frontend/lib/api/*`, which sends cookies with
every request (`credentials: 'include'`) and reads the base URL from
`NEXT_PUBLIC_API_URL`.

## Scripts

From the repository root:

| Script                | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev:frontend`| Start the Next.js dev server         |
| `npm run dev:backend` | Start the API with hot reload        |
| `npm run build`       | Build the frontend for production    |
| `npm run typecheck`   | Type-check both packages             |

## CI

`.github/workflows/ci.yml` installs and type-checks both packages on every push and
pull request.

## Deploying the frontend to Vercel

The Next.js app lives in `frontend/`, so the Vercel project must point at it.

**Project Settings → General → Build & Deployment Settings**

| Setting        | Value                    |
| -------------- | ------------------------ |
| Root Directory | `frontend`               |
| Install Command| `pnpm install --frozen-lockfile` |
| Build Command  | `pnpm build`             |
| Output Directory | `.next`                |

`frontend/vercel.json` already pins the framework and those commands, so only
**Root Directory** has to be set in the dashboard.

Add the API base URL as a production environment variable in the same settings:

```
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

It is inlined into the client bundle at build time, so redeploy after changing it.
The `backend/` folder is not built by Vercel — deploy the API separately (Railway,
Render, Fly, or your own host) and point `NEXT_PUBLIC_API_URL` at it.

If the project is left with the Root Directory on the repository root, the build
fails with an explicit message from the root `vercel.json` instead of a confusing
`NEXT_NO_VERSION` error.
