import { type Request, type Response, type NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("System Error Logged", err?.message || err);

    const statusCode = err?.statusCode || 500;
    const message = err?.message || "internal Server Operational Failure";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};
