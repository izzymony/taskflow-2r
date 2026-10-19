
import { mysqlTable,mysqlEnum, int, varchar, timestamp,customType, boolean } from "drizzle-orm/mysql-core";
import { defineRelations } from "drizzle-orm";
import { ja } from "zod/v4/locales";



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
    title: varchar({length:150}).notNull(),
    status: mysqlEnum('status', ['Todo', 'In PProgress', 'completed']).default("Todo").notNull(),
    priority: mysqlEnum('proprity', ['Low' ,'Medium' , 'High' , 'Critical']).default("Low").notNull(),
    description:varchar({length:1500}).notNull(),
    dueDate: timestamp('due_date', { mode: 'string' }),
    tags: jsonArrayParser('specialties').default([]),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const relations = defineRelations({users,refreshTokens,tasks}, (r)=>({

     users: {
    refreshTokens: r.one.refreshTokens({
      from: r.users.id,
      to: r.refreshTokens.userId,
}),

 tasks: r.one.tasks({
      from: r.users.id,
      to: r.tasks.createdBy,
}),


   
  },

}))