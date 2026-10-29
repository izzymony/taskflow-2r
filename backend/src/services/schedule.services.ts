import { db } from "../db";
import { type Response, type Request, type NextFunction } from "express";
import { CreateSchedules, UpdateSchedules, type ScheduleTypes } from "@/validators/schedule.validator";
import { sql } from "drizzle-orm";

export async function createScheduleService(id: number, user_id: number, req: Request, res: Response, next: NextFunction) {
  const validate = CreateSchedules.parse(req.body);
  const { title, description, date, startTime, endTime, type, attendees, location } = validate;

  const startDateTime = `${date} ${startTime}:00`;
  const endDateTime = `${date} ${endTime}:00`;

  await db.execute(sql`
    INSERT INTO schedules (id, user_id, date, startTime, endTime, location, type, description, attendees, title)
    VALUES (${id}, ${user_id}, ${date}, ${startDateTime}, ${endDateTime}, ${location}, ${type as ScheduleTypes}, ${description}, ${JSON.stringify(attendees ?? [])}, ${title})
  `);

  const [rows] = (await db.execute(sql`SELECT * FROM schedules WHERE id = ${id}`)) as unknown as any[][];
  return rows?.[0] ?? null;
}

export async function getEvents(userId: number) {
  const [rows] = (await db.execute(sql`SELECT * FROM schedules WHERE user_id = ${userId}`)) as unknown as any[][];
  return rows ?? [];
}

export async function updateSchedules(id: number, req: Request, res: Response, next: NextFunction) {
  const user_id = res.locals.user?.userId;
  if (!Number.isInteger(user_id)) {
    throw new Error("Invalid user id");
  }

  const validate = UpdateSchedules.parse(req.body);
  const { title, description, startTime, endTime, type, attendees, location } = validate;

  const setClauses = [
    title !== undefined ? sql`title = ${title}` : null,
    description !== undefined ? sql`description = ${description}` : null,
    startTime !== undefined ? sql`startTime = ${startTime}` : null,
    endTime !== undefined ? sql`endTime = ${endTime}` : null,
    type !== undefined ? sql`type = ${type}` : null,
    attendees !== undefined ? sql`attendees = ${JSON.stringify(attendees)}` : null,
    location !== undefined ? sql`location = ${location}` : null,
  ].filter((clause): clause is NonNullable<typeof clause> => clause !== null);

  if (setClauses.length === 0) {
    return null;
  }

  await db.execute(sql`
    UPDATE schedules SET
    ${sql.join(setClauses, sql`, `)}
    WHERE id = ${id} AND user_id = ${user_id}
  `);

  const [rows] = (await db.execute(sql`SELECT * FROM schedules WHERE id = ${id} AND user_id = ${user_id}`)) as unknown as any[][];
  return rows?.[0] ?? null;
}

export async function deleteSchedules(id: number, req: Request, res: Response, next: NextFunction) {
  const user_id = res.locals.user?.userId;
  if (!Number.isInteger(user_id)) {
    throw new Error("Invalid user id");
  }

  await db.execute(sql`DELETE FROM schedules WHERE id = ${id} AND user_id = ${user_id}`);

  return { id, user_id };
}
