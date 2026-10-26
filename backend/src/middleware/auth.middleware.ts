import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.services";
import { ZodError, type ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (error) {
      if (!(error instanceof ZodError)) {
        return next(error);
      }

      const errors = error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      }));
      const message = errors
        .map(({ path, message }) => (path ? `${path}: ${message}` : message))
        .join("; ");

      return res.status(400).json({
        success: false,
        message: message || "Validation error",
        errors,
      });
    }
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract access token from secure cookies or Authorization Bearer header
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const token = req.cookies?.access_token || bearerToken;

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