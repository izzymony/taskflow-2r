import { type Request, type Response } from "express"; // Assuming Express types
import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createTask(req: Request) {
    // 1. In Express, use req.body (not await req.json())
    const { id, createdBy, title, priority, description, dueDate, tags, status } = req.body; 

    // 2. Map your columns perfectly 1-to-1 inside the raw SQL string
    const result = await db.execute(sql`
        INSERT INTO tasks (id, createdBy, title, priority, description, due_date, tags, status) 
        VALUES (${id}, ${createdBy}, ${title}, ${priority}, ${description}, ${dueDate}, ${tags}, ${status})
    `);

    // 3. MySQL returns an execution summary metadata object, not the created row data.
    // To return what was inserted, we return the inputs combined with the inserted ID.
    return result ? { id, title, status } : null;
}

// Fetch tasks, optionally filtered by the authenticated user
export async function getTasksService(userId?: number) {
  if (userId) {
    const rows = await db.execute(sql`select * from tasks where createdBy = ${userId} order by createdAt desc`);
    return rows;
  }
  const rows= await db.execute(sql`select * from tasks order by createdAt desc`);
  return rows;
}
