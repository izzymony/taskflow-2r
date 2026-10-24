import { db } from "../db";
import { eq } from "drizzle-orm";
import { projects } from "../db/schema";
import { randomUUID } from "crypto";
import {
  type ProjectInput,
  type ProjectStatus,
  PROJECT_STATUS,
  canTransitionProjectStatus,
} from "../validators/projects.validator";

export interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  userId: number;
  status: ProjectStatus;
  dueDate: string | null;
  createdAt: string;
}

function toProjectRecord(row: unknown): ProjectRecord {
  return {
    id: String((row as any).id),
    name: String((row as any).name),
    description: (row as any).description ?? null,
    clientId: String((row as any).clientId),
    userId: Number((row as any).userId),
    status: ((row as any).status ?? "Active") as unknown as ProjectStatus,
    dueDate: (row as any).dueDate ?? null,
    createdAt: String((row as any).createdAt),
  };
}

export async function getProjectsService(userId?: number, clientId?: string) {
  let rows: any[];
  if (clientId) {
    rows = await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(projects.createdAt);
  } else if (userId) {
    rows = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.createdAt);
  } else {
    rows = await db.select().from(projects).orderBy(projects.createdAt);
  }
  return rows.map(toProjectRecord);
}

export async function getProjectByIdService(id: string) {
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return row ? toProjectRecord(row) : null;
}

export async function createProjectService(input: ProjectInput) {
  const id = input.id || randomUUID();

  await db.insert(projects).values({
    id,
    name: input.name,
    description: input.description ?? null,
    clientId: input.clientId,
    userId: input.userId,
    status: input.status ?? "Active",
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  });

  return getProjectByIdService(id);
}

export async function updateProjectService(id: string, input: Partial<ProjectInput>) {
  const existing = await getProjectByIdService(id);
  if (!existing) return null;

  if (input.status !== undefined && input.status !== existing.status) {
    if (!canTransitionProjectStatus(existing.status, input.status as ProjectStatus)) {
      throw new Error(
        `A project cannot move from "${existing.status}" to "${input.status}".`,
      );
    }
  }

  await db
    .update(projects)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
      ...(input.userId !== undefined ? { userId: input.userId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
    })
    .where(eq(projects.id, id));

  return getProjectByIdService(id);
}

export async function deleteProjectService(id: string) {
  const existing = await getProjectByIdService(id);
  if (!existing) return null;
  await db.delete(projects).where(eq(projects.id, id));
  return existing;
}
