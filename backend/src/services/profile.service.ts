import { db } from "../db";
import{sql} from "drizzle-orm"



export async function fetchUserProfileById(id:number){
    
    const profile= await  db.execute(sql`select fullname, email, profileImageUrl from users where id = ${id}`)

    return profile ?? null;
}