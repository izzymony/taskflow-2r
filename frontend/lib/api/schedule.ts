import { api } from "./client";
import type { ApiResponse} from "@/lib/types/api";

import type { ICreateScheduleEventInput, IScheduleEvent } from "@/lib/types"; 

interface SchedulePayload{
     id: string | number;
      title: string;
      user_id: number;
      description: string;
      startTime: string; // HH:mm
      endTime: string; // HH:mm
      date: Date,
      attendees: string[];
      type: string | null;
      location?: string;
      created_at?: string;
}

function toScheduleEvent(data: SchedulePayload): IScheduleEvent {
    return {
        id: data.id,
        title: data.title,
        user_id: data.user_id,
        description: data.description,
        startTime: data.startTime,
        date: data.date,
        endTime: data.endTime,
        attendees: data.attendees,
        type: (data.type ?? "Meeting") as IScheduleEvent["type"],
        location: data.location,
        created_at: data.created_at,
    }
}

export const schedules = {
    list: () => api.get<ApiResponse<SchedulePayload[]>>("/api/schedules").then((response) => ({...response, data: response.data?.map(toScheduleEvent)})), 
    
    create: (input: Omit<ICreateScheduleEventInput, "user_id">) =>
    api
      .post<ApiResponse<SchedulePayload>>("/api/schedules", input)
      .then((response) => ({ ...response, data: response.data ? toScheduleEvent(response.data) : undefined })),

  /** Partial update of schedule event fields. */
  update: (id: string, input: Partial<ICreateScheduleEventInput>) =>
    api
      .patch<ApiResponse<SchedulePayload>>(`/api/schedules/${id}`, input)
      .then((response) => ({ ...response, data: response.data ? toScheduleEvent(response.data) : undefined })),

  remove: (id: string) =>
    api
      .delete<ApiResponse<SchedulePayload>>(`/api/schedules/${id}`)
      .then((response) => ({ ...response, data: response.data ? toScheduleEvent(response.data) : undefined })),
};


function toSchedulePayload(data: IScheduleEvent): SchedulePayload {
    return {
        id: data.id,
        title: data.title,
        user_id: data.user_id,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
        attendees: data.attendees,
        type: data.type,
        location: data.location,
        created_at: data.created_at,
    }
}