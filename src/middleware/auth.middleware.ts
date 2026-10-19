import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.services";
import { type ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.errors?.[0]?.message || "Validation error" });
    }
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract access token from secure cookies object
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decodedPayload = await verifyAccessToken(token);
    
    // Mount the user metadata context safely onto local variables
    res.locals.user = decodedPayload;
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
}