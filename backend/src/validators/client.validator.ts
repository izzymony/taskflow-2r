import {z} from "zod";
import { createSelectSchema } from "drizzle-orm/zod";
import {clients } from "@/db/schema";
import type { TaskStatus } from "./tasks.validator";

export const  CLIENT_STATUS =["Active", "Inactive", "Pending" ] as const
export const  CLIENT_PLAN = ["Starter",'Growth', 'Enterprise'] as const
export const BILLING_TYPES = ["Hourly", "Retainer", "Fixed_Project"] as const;


export type ClientStatus = (typeof CLIENT_STATUS)[number]
export type ClientPlan = (typeof CLIENT_PLAN)[number]
export type BillingType = (typeof BILLING_TYPES)[number]

export const CLIENT_STATUS_TRANSITIONS: Record<ClientStatus, ClientStatus[]> ={
    Pending:["Active", "Inactive"],
    Inactive:["Pending","Active"],
    Active:["Inactive", "Pending"]
}






export function canTransitionStatus(from: ClientStatus, to: ClientStatus): boolean {
  return from === to || ( CLIENT_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

export const clientTask = z.enum(CLIENT_STATUS)
export const clientPlan = z.enum(CLIENT_PLAN)
export const billingType =z.enum(BILLING_TYPES)


const baseUserSelectSchema = createSelectSchema(clients);

export const getClientsSchema = z.object({
params: z.object({
    id: z.string().optional(),
}).optional(),
})


export const cleanClients = baseUserSelectSchema.pick({
    id: true,
  title: true,
  userId: true,
  plan: true,
  status: true,
  billingType: true,
  rate: true,
  currency: true,
  monthlyBudgetCap: true,
  company: true,
  phone: true,
  email: true,
  contactName: true,
  createdAt: true,
})

export const UpdateClientInput = cleanClients.partial()