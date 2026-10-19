import { type Response, type Request, type NextFunction } from "express";
import { db } from "../db";
import { fetchUserProfileById } from "../services/profile.service";

export async function getUsers(req: Request, res: Response, next: NextFunction){
    try{
        const userId = res.locals.user?.id;

        if(!userId){
            return res.status(401).json({success: false, message: "Not authenticated"});
        }

        const profileData = await fetchUserProfileById(userId);

        if(!profileData){
            return res.status(404).json({success: false, message: "No User profile found"});
        }

        return res.status(200).json({success: true, data: profileData});
    }catch(error){
        next(error);
    }
}
