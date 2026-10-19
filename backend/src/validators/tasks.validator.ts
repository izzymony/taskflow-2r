import { type Request, type Response, type NextFunction } from "express";
import { db } from "../db";
import { createSelectSchema } from "drizzle-orm/zod";
import { tasks } from "../db/schema";

const baseTasksSelectSchema = createSelectSchema(tasks);

export const cleanTasksSchema = baseTasksSelectSchema.pick({
    id: true,
    createdBy: true,
    title: true,
    dueDate: true,
    status: true,
    tags: true,
    priority: true,
});

