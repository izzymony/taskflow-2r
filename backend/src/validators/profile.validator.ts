import { z } from "zod";
import {createSelectSchema} from "drizzle-orm/zod";
import { users } from "../db/schema";

const baseUserSelectSchema = createSelectSchema(users);

// Input Validation Schema (Validates incoming structural components from Express)
export const getUserProfileSchema = z.object({
  params: z.object({
    id: z.string().optional(),
  }).optional(),
});

// Output Filtering Schema (Zero-Trust Shield ensuring password credentials are blocked)
export const cleanProfileResponseSchema = baseUserSelectSchema.pick({
  id: true,
  fullname: true,
    createdAt: true,
  profileImageUrl: true,
});
