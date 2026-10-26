import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { projects } from "@/db/schema";

export const PROJECT_STATUS = ["Active", "Completed", "Paused"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  Active: ["Completed", "Paused"],
  Completed: ["Active", "Paused"],
  Paused: ["Active", "Completed"],
};

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return from === to || (PROJECT_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

const baseProjectSelectSchema = createSelectSchema(projects);

export const getProjectsSchema = z.object({
  params: z.object({
    id: z.string().optional(),
  }).optional(),
});

export const cleanProjects = baseProjectSelectSchema.pick({
  id: true,
  name: true,
  clientId: true,
  userId: true,
  description: true,
  status: true,
  dueDate: true,
  createdAt: true,
});

export type ProjectInput = z.infer<typeof cleanProjects>;

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required").max(255),
    clientId: z.string().min(1, "Client id is required"),
    userId: z.number().int().positive().optional(),
    description: z.string().optional(),
    status: z.enum(PROJECT_STATUS).default("Active"),
    dueDate: z.string().optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(255).optional(),
    clientId: z.string().min(1).optional(),
    userId: z.number().int().positive().optional(),
    description: z.string().optional(),
    status: z.enum(PROJECT_STATUS).optional(),
    dueDate: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, "Project id is required"),
  }),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
