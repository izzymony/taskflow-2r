import { Router } from "express";
import { createTaskSchema, updateTaskSchema } from "../validators/tasks.validator";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { create, getTasks, remove, update } from "../controllers/tasks.controller";

const router = Router();

router.get("/", requireAuth, getTasks);
router.post("/", requireAuth, validate(createTaskSchema), create);
router.patch("/:id", requireAuth, validate(updateTaskSchema), update);
router.delete("/:id", requireAuth, remove);

export default router;



