import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

export async function fetchUserProfileById(id: number) {
  const [profile] = await db
    .select({
      id: users.id,
      fullname: users.fullname,
      email: users.email,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return profile ?? null;
}

import { pgTable, text, timestamp, varchar, integer, numeric } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),       // Starter, Growth, Enterprise
  status: varchar("status", { length: 50 }).notNull(),   // Active, Inactive, Pending

  // --- NEW FINANCIAL / PRICING FIELDS ---
  billingType: varchar("billing_type", { length: 50 }).default("Hourly").notNull(), // Hourly, Retainer, Fixed_Project
  rate: numeric("rate", { precision: 10, scale: 2 }).default("0.00").notNull(),     // e.g., $150.00/hr or $3000/mo retainer
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  monthlyBudgetCap: integer("monthly_budget_cap"), // Optional: alert creative if tasks exceed this limit

  email: varchar("email", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
