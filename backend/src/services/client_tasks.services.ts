import { db } from "../db";
import { eq } from "drizzle-orm";
import { clientTasks } from "../db/schema";
import {
  type ClientTaskInput,
  type ClientTaskStatus,
  CLIENT_TASK_STATUSES,
  canTransitionClientTaskStatus,
} from "../validators/client_tasks.validator";

export interface ClientTaskRecord {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  clientId: string;
  status: ClientTaskStatus;
  billable: number;
  estimatedHours: string | null;
  assignedTo: string | null;
  createdAt: string;
}

function toClientTaskRecord(row: unknown): ClientTaskRecord {
  return {
    id: String((row as any).id),
    title: String((row as any).title),
    description: (row as any).description ?? null,
    projectId: String((row as any).projectId),
    clientId: String((row as any).clientId),
    status: ((row as any).status ?? "Backlog") as unknown as ClientTaskStatus,
    billable: Number((row as any).billable ?? 1),
    estimatedHours: (row as any).estimatedHours ?? null,
    assignedTo: (row as any).assignedTo ?? null,
    createdAt: String((row as any).createdAt),
  };
}

export async function getClientTasksService(clientId?: string) {
  let rows: any[];
  if (clientId) {
    rows = await db
      .select()
      .from(clientTasks)
      .where(eq(clientTasks.clientId, clientId))
      .orderBy(clientTasks.createdAt);
  } else {
    rows = await db.select().from(clientTasks).orderBy(clientTasks.createdAt);
  }
  return rows.map(toClientTaskRecord);
}

export async function getClientTaskByIdService(id: string) {
  const [row] = await db
    .select()
    .from(clientTasks)
    .where(eq(clientTasks.id, id))
    .limit(1);
  return row ? toClientTaskRecord(row) : null;
}

export async function createClientTaskService(input: ClientTaskInput) {
  const id = input.id || crypto.randomUUID();

  await db.insert(clientTasks).values({
    id,
    title: input.title,
    description: input.description ?? null,
    projectId: input.projectId,
    clientId: input.clientId,
    status: input.status ?? "Backlog",
    billable: input.billable ?? 1,
    estimatedHours: input.estimatedHours ?? null,
    assignedTo: input.assignedTo ?? null,
  });

  return getClientTaskByIdService(id);
}

export async function updateClientTaskService(id: string, input: Partial<ClientTaskInput>) {
  const existing = await getClientTaskByIdService(id);
  if (!existing) return null;

  if (input.status !== undefined && input.status !== existing.status) {
    if (!canTransitionClientTaskStatus(existing.status, input.status as ClientTaskStatus)) {
      throw new Error(
        `A client task cannot move from "${existing.status}" to "${input.status}".`,
      );
    }
  }

  await db
    .update(clientTasks)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.billable !== undefined ? { billable: input.billable } : {}),
      ...(input.estimatedHours !== undefined ? { estimatedHours: input.estimatedHours } : {}),
      ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
    })
    .where(eq(clientTasks.id, id));

  return getClientTaskByIdService(id);
}

export async function deleteClientTaskService(id: string) {
  const existing = await getClientTaskByIdService(id);
  if (!existing) return null;
  await db.delete(clientTasks).where(eq(clientTasks.id, id));
  return existing;
}
