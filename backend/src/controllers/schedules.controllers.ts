import { type Response, type Request, type NextFunction } from "express";
import { createScheduleService, getEvents, updateSchedules, deleteSchedules } from "@/services/schedule.services";

function resolveUserId(res: Response): number | null {
  const userId = res.locals.user?.userId;
  return typeof userId === "number" ? userId : null;
}

export async function createScheduleController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const id = Math.floor(Math.random() * 1000000);
    const schedule = await createScheduleService(id, userId, req, res, next);
    return res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function updateScheduleController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid schedule id" });
    }

    const schedule = await updateSchedules(id, req, res, next);
    return res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function getEventsController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const events = await getEvents(userId);
    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function deleteScheduleController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid schedule id" });
    }

    const schedule = await deleteSchedules(id, req, res, next);
    return res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}
