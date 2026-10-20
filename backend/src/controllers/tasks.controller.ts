import { type Response, type Request, type NextFunction } from "express";
import { db } from "../db";
import { createTask, getTasksService } from "../services/task.services";

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const newTask = await createTask(req);

        if (!newTask) {
            return res.status(400).json({ success: false, message: "Failed to create task" });
        }

        res.status(201).json({
            success: true,
            data: newTask
        });
    } catch (error) {
        next(error);
    }
}

export async function getTasks(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.user?.userId;
        const tasks = await getTasksService(userId);
        return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
}
