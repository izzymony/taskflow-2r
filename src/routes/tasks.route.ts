import { Router } from "express";
import { cleanTasksSchema } from "../validators/tasks.validator";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { create, getTasks } from "../controllers/tasks.controller";

const router = Router();

router.get("/", requireAuth, getTasks);
router.post("/", requireAuth, validate(cleanTasksSchema), create);

export default router;
