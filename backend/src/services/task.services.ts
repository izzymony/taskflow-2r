import { db } from "../db";
import { and, desc, eq } from "drizzle-orm";
import { tasks, users, clients, projects } from "../db/schema";
import {
  type CreateTaskInput,
  type TaskStatus,
  type UpdateTaskInput,
  canTransitionStatus,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../validators/tasks.validator";

const taskColumns = {
  id: tasks.id,
  createdBy: tasks.createdBy,
  assignedTo: tasks.assignedTo,
  clientId: tasks.clientId,
  projectId: tasks.projectId,
  title: tasks.title,
  status: tasks.status,
  priority: tasks.priority,
  description: tasks.description,
  dueDate: tasks.dueDate,
  tags: tasks.tags,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
};

export interface TaskRecord {
  id: number;
  createdBy: number;
  assignedTo: number | null;
  clientId: string | null;
  projectId: string | null;
  title: string;
  status: (typeof TASK_STATUSES)[number];
  priority: (typeof TASK_PRIORITIES)[number];
  description: string;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
}

/** MySQL DATETIME literals, not ISO strings. */
function toMysqlDateTime(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toTaskRecord(row: Omit<TaskRecord, "dueDate" | "createdAt" | "updatedAt" | "tags"> & {
  dueDate: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags: string[] | null;
}): TaskRecord {
  return {
    ...row,
    clientId: row.clientId ?? null,
    projectId: row.projectId ?? null,
    dueDate: toIso(row.dueDate),
    createdAt: toIso(row.createdAt) ?? "",
    updatedAt: toIso(row.updatedAt) ?? "",
    tags: row.tags ?? [],
  };
}

function selectTaskColumns() {
  return db
    .select({ ...taskColumns, creatorName: users.fullname })
    .from(tasks)
    .leftJoin(users, eq(tasks.createdBy, users.id));
}

/** Fetch tasks, optionally scoped to the authenticated user or a client. */
export async function getTasksService(userId?: number, clientId?: string) {
  const query = selectTaskColumns().orderBy(desc(tasks.createdAt));
  const rows = clientId
    ? await query.where(eq(tasks.clientId, clientId))
    : userId
      ? await query.where(eq(tasks.createdBy, userId))
      : await query;
  return rows.map(toTaskRecord);
}

export async function getTaskByIdService(id: number) {
  const [row] = await selectTaskColumns().where(eq(tasks.id, id)).limit(1);
  return row ? toTaskRecord(row) : null;
}

export async function createTaskService(
  userId: number,
  input: CreateTaskInput,
): Promise<TaskRecord | null> {
  const [inserted] = await db
    .insert(tasks)
    .values({
      createdBy: userId,
      assignedTo: input.assignedTo ?? null,
      clientId: input.clientId ?? null,
      projectId: input.projectId ?? null,
      title: input.title,
      status: input.status ?? "Todo",
      priority: input.priority ?? "Medium",
      description: input.description ?? "",
      dueDate: toMysqlDateTime(input.dueDate),
      tags: input.tags ?? [],
    })
    .$returningId();

  const id = inserted?.id;
  if (!id) return null;

  return getTaskByIdService(id);
}

/** Thrown when a task is asked to move to a status it cannot reach. */
export class InvalidStatusTransitionError extends Error {
  readonly from: TaskStatus;
  readonly to: TaskStatus;

  constructor(from: TaskStatus, to: TaskStatus) {
    super(`A task cannot move from "${from}" to "${to}".`);
    this.name = "InvalidStatusTransitionError";
    this.from = from;
    this.to = to;
  }
}

export async function updateTaskService(
  id: number,
  input: UpdateTaskInput,
): Promise<TaskRecord | null> {
  const existing = await getTaskByIdService(id);
  if (!existing) return null;

  if (input.status !== undefined && input.status !== existing.status) {
    if (!canTransitionStatus(existing.status, input.status)) {
      throw new InvalidStatusTransitionError(existing.status, input.status);
    }
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.assignedTo !== undefined) patch.assignedTo = input.assignedTo;
  if (input.clientId !== undefined) patch.clientId = input.clientId;
  if (input.projectId !== undefined) patch.projectId = input.projectId;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.dueDate !== undefined) patch.dueDate = toMysqlDateTime(input.dueDate);

  await db
    .update(tasks)
    .set(patch)
    .where(and(eq(tasks.id, id)));

  return getTaskByIdService(id);
}

export async function deleteTaskService(id: number) {
  const existing = await getTaskByIdService(id);
  if (!existing) return null;
  await db.delete(tasks).where(eq(tasks.id, id));
  return existing;
}
