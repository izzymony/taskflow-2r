import { api } from './client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  ICreateTaskInput,
  ICreateClientTaskInput,
  ITask,
  IUpdateTaskInput,
  TaskPriority,
  TaskStatus,
} from '@/lib/types';

/**
 * Shape returned by the API. The backend exposes the `tasks` columns through
 * drizzle, which maps `due_date`, `created_at` and `updated_at` to camelCase.
 */
interface ITaskPayload {
  id: number;
  createdBy: number;
  assignedTo: number | null;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  dueDate: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  creatorName?: string | null;
}

/** Maps an API task onto the database column names used by the app. */
function toTask(task: ITaskPayload): ITask {
  return {
    id: task.id,
    createdBy: task.createdBy,
    assignedTo: task.assignedTo ?? null,
    title: task.title,
    status: task.status,
    priority: task.priority,
    description: task.description ?? '',
    due_date: task.dueDate ?? null,
    tags: task.tags ?? [],
    updated_at: task.updatedAt,
    created_at: task.createdAt,
    creatorName: task.creatorName ?? null,
  };
}

/** Maps the database shaped input onto the payload the API expects. */
function toPayload(input: IUpdateTaskInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.due_date !== undefined ? { dueDate: input.due_date } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
  };
}

export function listTasks() {
  return api
    .get<ApiResponse<ITaskPayload[]>>('/api/tasks')
    .then((response) => ({ ...response, data: response.data?.map(toTask) }));
}

/** Fetch tasks scoped to a specific client (client-scoped tasks). */
export function listClientTasks(clientId: string) {
  return api
    .get<ApiResponse<ITaskPayload[]>>(`/api/tasks?clientId=${encodeURIComponent(clientId)}`)
    .then((response) => ({ ...response, data: response.data?.map(toTask) }));
}

export function createTask(input: ICreateTaskInput) {
  return api
    .post<ApiResponse<ITaskPayload>>('/api/tasks', toPayload(input))
    .then((response) => ({ ...response, data: response.data ? toTask(response.data) : undefined }));
}

/** Create a task attached to a client (and optionally a project). */
export function createClientTask(input: ICreateClientTaskInput) {
  const { clientId, projectId, ...rest } = input;
  return api
    .post<ApiResponse<ITaskPayload>>('/api/tasks', toPayload({ ...rest, clientId, projectId }))
    .then((response) => ({ ...response, data: response.data ? toTask(response.data) : undefined }));
}

export function updateTask(id: ITask['id'], input: IUpdateTaskInput) {
  return api
    .patch<ApiResponse<ITaskPayload>>(`/api/tasks/${id}`, toPayload(input))
    .then((response) => ({ ...response, data: response.data ? toTask(response.data) : undefined }));
}

export function deleteTask(id: ITask['id']) {
  return api
    .delete<ApiResponse<ITaskPayload>>(`/api/tasks/${id}`)
    .then((response) => ({ ...response, data: response.data ? toTask(response.data) : undefined }));
}
