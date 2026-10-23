
import { mysqlTable,mysqlEnum, int, varchar,  timestamp,customType, boolean , decimal, text} from "drizzle-orm/mysql-core";
import { defineRelations } from "drizzle-orm";
import { ja } from "zod/v4/locales";
import { title } from "node:process";



const jsonArrayParser = customType<{ data: string[]; driverData: string }>({
  dataType() {
    return 'json';
  },

  toDriver(value: string[]) {
    return JSON.stringify(value);
  }, 

  fromDriver(value: unknown) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [];
      }
    }

    return (value as string[]) || [];
  },
});

export const users = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  profileImageUrl: varchar({length:255}),
  role: varchar({length:300}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokens = mysqlTable("refresh_tokens", {
  id: int().primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar({ length: 500 }).notNull().unique(),
  isRevoked: boolean("is_revoked").default(false).notNull(),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const tasks = mysqlTable("tasks",{
    id: int().primaryKey().autoincrement().notNull(),
    createdBy: int().references(()=> users.id, {onDelete: "cascade"}).notNull(),
    assignedTo: int().references(()=> users.id, {onDelete: "set null"}),
    clientId: varchar("client_id", { length: 255 }).references(()=> clients.id, { onDelete: "set null" }),
    projectId: varchar("project_id", { length: 255 }).references(()=> projects.id, { onDelete: "set null" }),
    title: varchar({length:150}).notNull(),
    status: mysqlEnum('status', ['Todo', 'In Progress', 'Under Review', 'Completed']).default("Todo").notNull(),
    priority: mysqlEnum('priority', ['Low' ,'Medium' , 'High' , 'Critical']).default("Medium").notNull(),
    description:varchar({length:1500}).notNull(),
    dueDate: timestamp('due_date', { mode: 'string' }),
    tags: jsonArrayParser('tags').default([]),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),       // Starter, Growth, Enterprise
  status: varchar("status", { length: 50 }).notNull(),   // Active, Inactive, Pending
  company:varchar({length:350}).notNull(),
  phone:varchar({length:11}).notNull(),
  // Financial Pricing Fields configured for MySQL
  billingType: varchar("billing_type", { length: 50 }).default("Hourly").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).default("0.00").notNull(),     // e.g., 150.00
  currency: varchar("currency", { length: 10 }).default("NGN").notNull(),
  monthlyBudgetCap: int("monthly_budget_cap"),

  email: varchar("email", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text("description"),
  clientId: varchar("client_id", { length: 255 }).references(() => clients.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("Active").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. CLIENT ASSOCIATED TASKS TABLE (Belongs to a Project & Client)
export const clientTasks = mysqlTable("client_tasks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  projectId: varchar("project_id", { length: 255 }).references(() => projects.id, { onDelete: "cascade" }).notNull(),
  clientId: varchar("client_id", { length: 255 }).references(() => clients.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("Backlog").notNull(),
  billable: int("billable").default(1).notNull(),
  estimatedHours: varchar("estimated_hours", { length: 50 }),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. CLIENT



export const relations = defineRelations({users,refreshTokens,tasks,clients,projects,clientTasks}, (r)=>({

     users: {
    refreshTokens: r.one.refreshTokens({
      from: r.users.id,
      to: r.refreshTokens.userId,
}),

 tasks: r.one.tasks({
      from: r.users.id,
      to: r.tasks.createdBy,
}),


 clients: r.one.clients({
      from: r.users.id,
      to: r.clients.userId,
}),

},

clients: {
    projects: r.many.projects({
      from: r.clients.id,
      to: r.projects.clientId,
    }),
    clientTasks: r.many.clientTasks({
      from: r.clients.id,
      to: r.clientTasks.clientId,
    }),
},

projects: {
    tasks: r.many.tasks({
      from: r.projects.id,
      to: r.tasks.projectId,
    }),
    clientTasks: r.many.clientTasks({
      from: r.projects.id,
      to: r.clientTasks.projectId,
    }),
},

clientTasks: {
    project: r.one.projects({
      from: r.clientTasks.projectId,
      to: r.projects.id,
    }),
    client: r.one.clients({
      from: r.clientTasks.clientId,
      to: r.clients.id,
    }),
},

}))