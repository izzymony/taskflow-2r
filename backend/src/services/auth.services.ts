import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index";
import { users, refreshTokens } from "../db/schema";
import { env } from "../config/env";

const JWT_SECRET = new TextEncoder().encode(env.jwtSecret);

export interface SessionPayload {
  userId: number;
}

// Generate a secure 15-minute Access Token bound to an HTTP-Only Cookie
export async function createAccessToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Generate a structural 7-day Refresh Token, logged securely inside MySQL
export async function createRefreshToken(userId: number): Promise<string> {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 Days operational window

  await db.insert(refreshTokens).values({
    userId,
    token: rawToken,
    expiresAt,
  });

  return rawToken;
}



// Verify an incoming access token string
export async function verifyAccessToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: Number(payload.sub),
  };
}