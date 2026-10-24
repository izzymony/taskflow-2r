import { type Response, type Request, type NextFunction } from "express";
import {
  createClientTaskService,
  deleteClientTaskService,
  getClientTaskByIdService,
  getClientTasksService,
  updateClientTaskService,
} from "@/services/client_tasks.services";

function resolveUserId(res: Response): number | null {
  const userId = res.locals.user?.userId;
  return typeof userId === "number" ? userId : null;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const clientId = req.query.clientId;
    const tasks = await getClientTasksService(
      typeof clientId === "string" ? clientId : undefined,
      userId,
    );
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const newTask = await createClientTaskService({ ...req.body, userId });
    if (!newTask) {
      return res.status(400).json({ success: false, message: "Failed to create client task" });
    }

    return res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, message: "Invalid client task id" });
    }

    const updated = await updateClientTaskService(id, { ...req.body, userId });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Client task not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, message: "Invalid client task id" });
    }

    const deleted = await deleteClientTaskService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Client task not found" });
    }

    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}
