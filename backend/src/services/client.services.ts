import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { clients } from "../db/schema";
import {
  createClientSchema,
  UpdateClientInput,
  type ClientPlan,
  type ClientStatus,
  type BillingType,
} from "@/validators/client.validator";

type CreateClientInput = z.infer<typeof createClientSchema>["body"];

export async function createClient(input: CreateClientInput & { userId: number }) {
  const parsed = createClientSchema.shape.body.parse(input);

  const id = parsed.id || `client-${Date.now()}`;
  const title = parsed.title;
  const company = parsed.company;
  const phone = parsed.phone;
  const email = parsed.email ?? null;
  const contactName = parsed.contactName ?? null;
  const plan: ClientPlan = parsed.plan as ClientPlan;
  const status: ClientStatus = parsed.status as ClientStatus;
  const billingType: BillingType = parsed.billingType as BillingType;
  const rate = parsed.rate ?? "0.00";
  const currency = parsed.currency ?? "NGN";
  const monthlyBudgetCap = parsed.monthlyBudgetCap ?? null;
  const userId = input.userId;

  await db.execute(sql`
    INSERT INTO clients (id, title, user_id, plan, status, company, phone, email, contact_name, billing_type, rate, currency, monthly_budget_cap)
    VALUES (${id}, ${title}, ${userId}, ${plan}, ${status}, ${company}, ${phone}, ${email}, ${contactName}, ${billingType}, ${rate}, ${currency}, ${monthlyBudgetCap})
  `);

  return {
    id,
    title,
    company,
    phone,
    email,
    contactName,
    plan,
    status,
    billingType,
    rate,
    currency,
    monthlyBudgetCap,
    userId,
    createdAt: new Date().toISOString(),
  };
}

const COLUMN_MAP: Record<string, string> = {
  contactName: "contact_name",
  billingType: "billing_type",
  monthlyBudgetCap: "monthly_budget_cap",
  userId: "user_id",
  createdAt: "created_at",
  phone: "phone",
  email: "email",
  title: "title",
  company: "company",
  plan: "plan",
  status: "status",
  rate: "rate",
  currency: "currency",
};

export async function updateClient(id: string, input: Record<string, unknown>) {
  const validatedData = UpdateClientInput.parse(input);

  const entries = Object.entries(validatedData);
  if (entries.length === 0) {
    return null;
  }

  const setChunks = entries.map(([key, val]) => {
    const column = COLUMN_MAP[key] ?? key;
    return sql.raw(column).append(sql` = ${val}`);
  });
  const setQuery = sql.join(setChunks, sql`, `);

  const result = await db.execute(sql`
    UPDATE clients
    SET ${setQuery}
    WHERE id = ${id}
  `);

  return result ?? null;
}

export async function getClientListing(userId: number) {
  const [rows] = await db.execute(sql`
    select id, title, company, contact_name as contactName, phone, email, user_id as userId,
           status, plan, billing_type as billingType, rate, currency, monthly_budget_cap as monthlyBudgetCap,
           created_at as createdAt
    from clients
    where user_id = ${userId}
    order by created_at desc
  `);

  return rows ?? null;
}

export async function deleteClient(id: string) {
  const [existing] = await db.execute(sql`select id from clients where id = ${id} limit 1`);
  if (!Array.isArray(existing) || existing.length === 0) return null;

  await db.execute(sql`delete from clients where id = ${id}`);
  return existing[0];
}
