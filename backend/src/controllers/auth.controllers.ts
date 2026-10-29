import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import { createAccessToken, createRefreshToken } from "../services/auth.services";
import { env } from "../config/env";

// The frontend and the API are served from different sites (e.g. app.vercel.app
// and api.onrender.com). Browsers only attach such cookies when the request is
// cross-site AND the cookie opts into it via SameSite=None; Secure.
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSameSite === "none" || env.isProduction,
  sameSite: env.cookieSameSite,
  path: "/",
};

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullname, email, password } = req.body;

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [inserted] = await db.insert(users).values({ fullname, email, passwordHash }).$returningId();
    const userId = inserted?.id ?? 0;
    const accessToken = await createAccessToken({ userId });
    const refreshToken = await createRefreshToken(userId);

    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: accessToken,
      user: {
        id: userId,
        fullname,
        email,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // 1. Fetch matching user row entity
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password parameters" });
    }

    // 2. Cryptographic password evaluation
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password parameters" });
    }

    // 3. Issue Dual-Tokens tokens
    const accessToken = await createAccessToken({ userId: user.id });
    if (!accessToken) {
      return next(new Error("Failed to generate access token"));
    }

    const refreshToken = await createRefreshToken(user.id);
    if (!refreshToken) {
      return next(new Error("Failed to generate refresh token"));
    }

    // 4. Attach tokens inside secure HttpOnly cookie containers
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}
