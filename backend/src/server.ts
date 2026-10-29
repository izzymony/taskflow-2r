import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import tasksRouter from "./routes/tasks.route";
import clientRouter from "./routes/client.routes";
import clientTasksRouter from "./routes/client_tasks.route";
import projectsRouter from "./routes/projects.routes";
import profileRouter from "./routes/profile.routes";
import { errorHandler } from "./middleware/error-handlers";
import schedulesRouter from "./routes/schedule.route";
import { env } from "./config/env";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && env.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (origin) {
    console.warn(
      `[cors] Rejected origin "${origin}". Allowed: ${env.allowedOrigins.join(", ")}`,
    );
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use("/api/auth", authRouter);
app.use("/api", profileRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/clients", clientRouter);
app.use("/api/client-tasks", clientTasksRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/schedules", schedulesRouter);

const health = (req: Request, res: Response) => {
  res.json({ success: true, status: "ok" });
};

app.get("/api/health", health);
app.get("/api", health);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`⚡ [server]: Blueprint engine processing securely on port ${env.port}`);
});
