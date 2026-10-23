import { type Response, type Request, type NextFunction } from "express";
import {
  createTaskService,
  deleteTaskService,
  getTasksService,
  InvalidStatusTransitionError,
  updateTaskService,
} from "../services/task.services";

function resolveUserId(res: Response): number | null {
  const userId = res.locals.user?.userId;
  return typeof userId === "number" ? userId : null;
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const newTask = await createTaskService(userId, req.body);

    if (!newTask) {
      return res.status(400).json({ success: false, message: "Failed to create task" });
    }

    return res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
}

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    const clientId = req.query.clientId;
    const tasks = await getTasksService(userId ?? undefined, typeof clientId === "string" ? clientId : undefined);
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const updated = await updateTaskService(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      return res.status(422).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const deleted = await deleteTaskService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}
