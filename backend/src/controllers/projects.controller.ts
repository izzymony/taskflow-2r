import { type Response, type Request, type NextFunction } from "express";
import {
  createProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectsService,
  updateProjectService,
} from "@/services/projects.services";

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
    const projects = await getProjectsService(
      userId,
      typeof clientId === "string" ? clientId : undefined,
    );
    return res.status(200).json({ success: true, data: projects });
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

    const newProject = await createProjectService({ ...req.body, userId });
    if (!newProject) {
      return res.status(400).json({ success: false, message: "Failed to create project" });
    }

    return res.status(201).json({ success: true, data: newProject });
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
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const updated = await updateProjectService(id, { ...req.body, userId });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Project not found" });
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
      return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const deleted = await deleteProjectService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}
