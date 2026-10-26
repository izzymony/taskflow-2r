import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { clientTasks } from "@/db/schema";

export const CLIENT_TASK_STATUSES = [
  "Backlog",
  "Todo",
  "In Progress",
  "Under Review",
  "Completed",
] as const;

export type ClientTaskStatus = (typeof CLIENT_TASK_STATUSES)[number];

export const CLIENT_TASK_STATUS_TRANSITIONS: Record<ClientTaskStatus, ClientTaskStatus[]> = {
  Backlog: ["Todo", "In Progress", "Completed"],
  Todo: ["In Progress", "Under Review", "Completed"],
  "In Progress": ["Under Review", "Completed", "Todo"],
  "Under Review": ["In Progress", "Completed", "Todo"],
  Completed: ["Todo", "Backlog"],
};

export function canTransitionClientTaskStatus(from: ClientTaskStatus, to: ClientTaskStatus): boolean {
  return from === to || (CLIENT_TASK_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

const baseClientTaskSelectSchema = createSelectSchema(clientTasks);

export const getClientTasksSchema = z.object({
  params: z.object({
    id: z.string().optional(),
  }).optional(),
});

export const cleanClientTasks = baseClientTaskSelectSchema.pick({
  id: true,
  title: true,
  description: true,
  projectId: true,
  clientId: true,
  userId: true,
  status: true,
  billable: true,
  estimatedHours: true,
  assignedTo: true,
  createdAt: true,
});

export type ClientTaskInput = z.infer<typeof cleanClientTasks>;

export const createClientTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(255),
    description: z.string().optional(),
    projectId: z.string().min(1, "Project id is required"),
    clientId: z.string().min(1, "Client id is required"),
    userId: z.number().int().positive(),
    status: z.enum(CLIENT_TASK_STATUSES).default("Backlog"),
    billable: z.number().int().default(1).optional(),
    estimatedHours: z.string().optional().nullable(),
    assignedTo: z.string().optional().nullable(),
  }),
});

export const updateClientTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().optional(),
    projectId: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    userId: z.number().int().positive().optional(),
    status: z.enum(CLIENT_TASK_STATUSES).optional(),
    billable: z.number().int().optional(),
    estimatedHours: z.string().optional().nullable(),
    assignedTo: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, "Client task id is required"),
  }),
});

export type UpdateClientTaskInput = z.infer<typeof updateClientTaskSchema>["body"];
