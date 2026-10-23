import { api } from './client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  IClient,
  ICreateClientInput,
  IProject,
  ICreateProjectInput,
} from '@/lib/types';

interface IClientPayload {
  id: string;
  userId: string;
  title: string;
  company: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  plan: string;
  billingType: string | null;
  rate: string | null;
  currency: string | null;
  monthlyBudgetCap: number | null;
  createdAt: string;
}

function toClient(payload: IClientPayload): IClient {
  return {
    id: payload.id,
    userId: payload.userId,
    title: payload.title,
    company: payload.company,
    contactName: payload.contactName ?? '',
    email: payload.email ?? '',
    phone: payload.phone ?? '',
    status: payload.status as IClient['status'],
    plan: payload.plan as IClient['plan'],
    billingType: (payload.billingType ?? 'Hourly') as IClient['billingType'],
    rate: payload.rate ?? '0',
    currency: payload.currency ?? 'NGN',
    monthlyBudgetCap: payload.monthlyBudgetCap ?? null,
    lastActivity: '',
    createdAt: payload.createdAt,
    avatar: payload.title.slice(0, 2).toUpperCase(),
    value: 0,
    location: 'Not set',
    projects: 0,
  };
}

interface IProjectPayload {
  id: string;
  name: string;
  clientId: string;
  userId: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function toProject(payload: IProjectPayload): IProject {
  return {
    id: payload.id,
    name: payload.name,
    clientId: payload.clientId,
    userId: payload.userId,
    description: payload.description ?? null,
    status: payload.status as IProject['status'],
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

export const clients = {
  list: () =>
    api
      .get<ApiResponse<IClientPayload[]>>('/api/clients')
      .then((response) => ({ ...response, data: response.data?.map(toClient) })),

  create: (input: ICreateClientInput) =>
    api
      .post<ApiResponse<IClientPayload>>('/api/clients', input)
      .then((response) => ({ ...response, data: response.data ? toClient(response.data) : undefined })),

  update: (id: string, input: Partial<ICreateClientInput>) =>
    api
      .patch<ApiResponse<IClientPayload>>(`/api/clients/${id}`, input)
      .then((response) => ({ ...response, data: response.data ? toClient(response.data) : undefined })),

  remove: (id: string) =>
    api
      .delete<ApiResponse<IClientPayload>>(`/api/clients/${id}`)
      .then((response) => ({ ...response, data: response.data ? toClient(response.data) : undefined })),
};

export const projects = {
  list: () =>
    api
      .get<ApiResponse<IProjectPayload[]>>('/api/projects')
      .then((response) => ({ ...response, data: response.data?.map(toProject) })),

  create: (input: ICreateProjectInput) =>
    api
      .post<ApiResponse<IProjectPayload>>('/api/projects', input)
      .then((response) => ({ ...response, data: response.data ? toProject(response.data) : undefined })),
};
