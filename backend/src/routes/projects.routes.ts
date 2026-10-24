import { z } from "zod";
import { Router } from "express";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { list, create, update, remove } from "../controllers/projects.controller";
import {
  getProjectsSchema,
  createProjectSchema,
  updateProjectSchema,
} from "../validators/projects.validator";

const router = Router();

router.get("/", requireAuth, validate(getProjectsSchema), list);
router.post("/", requireAuth, validate(createProjectSchema), create);
router.patch(
  "/:id",
  requireAuth,
  validate(updateProjectSchema),
  update,
);
router.delete(
  "/:id",
  requireAuth,
  validate(z.object({ params: getProjectsSchema.shape.params })),
  remove,
);

export default router;
