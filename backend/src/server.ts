import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import tasksRouter from "./routes/tasks.route"
import profileRouter from "./routes/profile.routes"
import { errorHandler } from './middleware/error-handlers';
const app: Express = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigin =  "http://localhost:3001";

  if (origin && allowedOrigin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use('/api/auth', authRouter);
app.use("/api", profileRouter)
app.use("/api/tasks", tasksRouter);


app.get('/api', (req: Request, res: Response) => {
  res.send('Healthy Hello World!');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`⚡ [server]: Blueprint engine processing securely on port ${PORT}`);
});