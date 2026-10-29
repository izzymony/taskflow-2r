import z from "zod";

export const SCHEDULE_TYPES = ["Meeting", "Deadline", "Focus"] as const
export type ScheduleTypes = (typeof SCHEDULE_TYPES)[number];
export const SCHEDULE_TYPES_SCHEMA: Record<ScheduleTypes, ScheduleTypes[]> ={
    Meeting:["Deadline", "Focus"],
    Deadline:["Meeting", "Focus"],
    Focus:["Meeting", "Deadline"],
}

export const getSchedules = z.object({
    params: z.object({
        id: z.string().optional()
    }).optional()
})

const scheduleBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  date: z.string(),
  type: z.enum(SCHEDULE_TYPES),
  attendees: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
})

// Fields the client sends when creating a schedule. user_id and id are
// injected server-side from the authenticated session, so they must not be
// required in the request body. Flat schema parsed directly against req.body.
export const CreateSchedules = scheduleBodySchema

export const UpdateSchedules = scheduleBodySchema.partial()

export const GetEvents = z.object({
  query: z.object({
    user_id: z.string().optional(),
  }).optional(),
})
