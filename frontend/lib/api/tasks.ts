import { api } from './client'
import type { ApiResponse } from '@/lib/types/api'
import type { ICreateTaskInput, ITask } from '@/lib/types'

export function listTasks() {
  return api.get<ApiResponse<ITask[]>>('/api/tasks')
}

export function createTask(input: ICreateTaskInput) {
  return api.post<ApiResponse<ITask>>('/api/tasks', input)
}
