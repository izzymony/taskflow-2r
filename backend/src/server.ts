import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import tasksRouter from "./routes/tasks.route";
import profileRouter from "./routes/profile.routes";
import { errorHandler } from "./middleware/error-handlers";
import { env } from "./config/env";
import { verifyConnection } from "./db";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && env.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
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

const health = (req: Request, res: Response) => {
  res.json({ success: true, status: "ok" });
};

app.get("/api/health", health);
app.get("/api", health);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`⚡ [server]: Blueprint engine processing securely on port ${env.port}`);
});

verifyConnection()
  .then(() => console.log(`🗄️ [database]: connected to ${env.database.host}/${env.database.database}`))
  .catch((error) => console.error(`🗄️ [database]: connection failed — ${error.message}`));
