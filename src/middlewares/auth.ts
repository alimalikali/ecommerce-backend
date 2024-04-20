import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";


//only admin is allowed middleqware
export const adminOnly = TryCatch(async(req,res,next)=>{
    const { id } = req.query;
    if (!id) return next(new ErrorHandler("saale login kar pahle",401))

    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("saale fake id deta hai",401))
    if (user.role !== "admin") return next(new ErrorHandler("saale aukat nahi tere",401))
        
    next();
});