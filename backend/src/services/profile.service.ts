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
