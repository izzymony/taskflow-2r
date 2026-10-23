import { z } from "zod";

export const TASK_STATUSES = ["Todo", "In Progress", "Under Review", "Completed"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** The statuses a task may move to, keyed by its current status. */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  Todo: ["In Progress", "Under Review", "Completed"],
  "In Progress": ["Under Review", "Completed", "Todo"],
  "Under Review": ["In Progress", "Completed", "Todo"],
  Completed: ["In Progress", "Todo"],
};

/** Whether a task may move from one status to another. */
export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  return from === to || (TASK_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

const taskBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().max(1500).default(""),
  status: taskStatusSchema.default("Todo"),
  priority: taskPrioritySchema.default("Medium"),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
  assignedTo: z.number().int().positive().nullable().optional(),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof taskBodySchema>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export const createTaskSchema = z.object({
  body: taskBodySchema,
});

export const updateTaskSchema = z.object({
  body: taskBodySchema.partial(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Task id must be a number"),
  }),
});
