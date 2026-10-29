import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

import {
    createScheduleController,
    updateScheduleController,
    getEventsController,
    deleteScheduleController
} from "../controllers/schedules.controllers";

const router = Router();

router.post("/", requireAuth, createScheduleController);
router.get("/", requireAuth, getEventsController);
router.patch("/:id", requireAuth, updateScheduleController);
router.delete("/:id", requireAuth, deleteScheduleController);

export default router;
