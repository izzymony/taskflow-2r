import { Router } from "express";
import { getUsers } from "../controllers/profile.controller";
import { getUserProfileSchema } from "../validators/profile.validator";
import { requireAuth, validate } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", requireAuth, validate(getUserProfileSchema), getUsers);

export default router;
