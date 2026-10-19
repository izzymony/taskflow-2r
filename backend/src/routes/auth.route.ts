import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/auth.controllers";
import { validate } from "../middleware/auth.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/signup", validate(registerSchema), registerHandler);
router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);

export default router;