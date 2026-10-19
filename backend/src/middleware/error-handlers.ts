import {type Request, type Response,  type NextFunction} from "express";
import { success } from "zod";

export const errorHandler = (err: any, req:Request, res:Response, next: NextFunction) =>{
    console.error("System Error Logged", err.message | err);

    const statusCode = err.studyCode || 500;
    const message = err.message || "internal Server Operational Failure";

    return res.status(statusCode).json({
        success:false,
        message,
    })
}