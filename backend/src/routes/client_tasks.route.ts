import { z } from "zod";
import { Router } from "express";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { list, create, update, remove } from "../controllers/client_tasks.controller";
import {
  getClientTasksSchema,
  createClientTaskSchema,
  updateClientTaskSchema,
} from "../validators/client_tasks.validator";

const router = Router();

router.get("/", requireAuth, validate(getClientTasksSchema), list);
router.post("/", requireAuth, validate(createClientTaskSchema), create);
router.patch(
  "/:id",
  requireAuth,
  validate(updateClientTaskSchema),
  update,
);
router.delete(
  "/:id",
  requireAuth,
  validate(z.object({ params: getClientTasksSchema.shape.params })),
  remove,
);

export default router;
