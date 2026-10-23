import { db } from "../db";
import { sql } from "drizzle-orm";
import { clients } from "../db/schema";
import {
  cleanClients,
  UpdateClientInput,
  type ClientPlan,
  type ClientStatus,
  type BillingType,
} from "@/validators/client.validator";

export async function createClient(input: Record<string, unknown>) {
  const validateClients = cleanClients.parse(input);
  const {
    id,
    userId,
    title,
    plan,
    email,
    contactName,
    company,
    status,
    billingType,
  } = validateClients;

  const planValue: ClientPlan = plan as ClientPlan;
  const statusValue: ClientStatus = status as ClientStatus;
  const billingTypeValue: BillingType = billingType as BillingType;

  const result = await db.execute(sql`
    INSERT INTO clients (id, title, user_id, plan, email, contact_name, company, status, billing_type)
    VALUES (${id}, ${title}, ${userId}, ${planValue}, ${email}, ${contactName}, ${company}, ${statusValue}, ${billingTypeValue})
  `);

  return result ?? null;
}

export async function updateClient(id: string, input: Record<string, unknown>) {
  const validatedData = UpdateClientInput.parse(input);

  const entries = Object.entries(validatedData);
  if (entries.length === 0) {
    return null;
  }

  const setChunks = entries.map(([key, val]) => sql.raw(key).append(sql` = ${val}`));
  const setQuery = sql.join(setChunks, sql`, `);

  const result = await db.execute(sql`
    UPDATE clients
    SET ${setQuery}
    WHERE id = ${id}
  `);

  return result ?? null;
}

export async function getClientListing(userId: number) {
  const rows = await db.execute(sql`
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
  if (!existing) return null;

  await db.execute(sql`delete from clients where id = ${id}`);
  return existing;
}
