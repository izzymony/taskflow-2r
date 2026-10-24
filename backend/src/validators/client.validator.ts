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

// Schema for creating a client via POST /api/clients.
// userId and createdAt are injected/defaulted by the DB — do not require them in the request body.
export const createClientSchema = z.object({
  body: z.object({
    id: z.string().min(1, "Client id is required").optional(),
    title: z.string().trim().min(1, "Title is required").max(255),
    company: z.string().trim().min(1, "Company is required").max(350),
    phone: z.string().trim().min(1, "Phone is required").max(11, "Phone must be at most 11 characters"),
    email: z.string().email("Invalid email").max(255).optional().nullable(),
    contactName: z.string().trim().max(255).optional().nullable(),
    plan: z.enum(CLIENT_PLAN),
    status: z.enum(CLIENT_STATUS),
    billingType: z.enum(BILLING_TYPES).default("Hourly"),
    rate: z.string().trim().min(1, "Rate is required").default("0.00"),
    currency: z.string().trim().min(1, "Currency is required").max(10).default("NGN"),
    monthlyBudgetCap: z.number().int().nonnegative().optional().nullable(),
  }),
});


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