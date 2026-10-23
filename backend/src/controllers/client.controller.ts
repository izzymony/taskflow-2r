import { type Response, type Request, type NextFunction } from "express";
import {
  createClient,
  updateClient,
  getClientListing,
  deleteClient,
} from "@/services/client.services";

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

    const newClient = await createClient({ ...req.body, userId });
    if (!newClient) {
      return res.status(400).json({ success: false, message: "Failed to create client" });
    }

    return res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = resolveUserId(res);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const clients = await getClientListing(userId);
    return res.status(200).json({ success: true, data: clients ?? [] });
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
      return res.status(400).json({ success: false, message: "Invalid client id" });
    }

    const updated = await updateClient(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Client not found" });
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
      return res.status(400).json({ success: false, message: "Invalid client id" });
    }

    const deleted = await deleteClient(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}
