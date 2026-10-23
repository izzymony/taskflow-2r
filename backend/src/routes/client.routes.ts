import { z } from "zod";
import { Router } from "express";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { create, getAll, update, remove } from "../controllers/client.controller";
import {
  getClientsSchema,
  UpdateClientInput,
  cleanClients,
} from "../validators/client.validator";

const router = Router();

router.get("/", requireAuth, getAll);
router.post("/", requireAuth, validate(z.object({ body: cleanClients })), create);
router.patch(
  "/:id",
  requireAuth,
  validate(z.object({ body: UpdateClientInput, params: getClientsSchema.shape.params })),
  update,
);
router.delete(
  "/:id",
  requireAuth,
  validate(z.object({ params: getClientsSchema.shape.params })),
  remove,
);

export default router;
