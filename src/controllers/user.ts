// const User = "."

import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(async ( req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await User.findById(_id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: `welcome ${user}`
      })
    }
    if (!_id || !name || !email || !photo || !gender || !dob) {
      next(new ErrorHandler("you are mssing some field,please add all feilds",400))
    }

    user = await User.create({ name, email, photo, gender, _id, dob: new Date(dob),
    });

    return res.status(201).json({
      status: "success",
      message: `welcome, ${user.name}`,
    });
  }
);
export const getAllUsers = TryCatch(async(req:Request,res:Response,next:NextFunction) =>{
  const users = await User.find({});
  return res.status(200).json({
    status: "success",
    users,
  })
});
export const getUser = TryCatch(async(req:Request,res:Response,next:NextFunction) =>{
  const { id:_id } =req.params;
  const user = await User.findById(_id);
  if (!user) return next (new ErrorHandler("no user,INVALID id ",400))
  return res.status(200).json({
    status: "success",
    user,
  })
});
export const deleteUser = TryCatch(async(req:Request,res:Response,next:NextFunction) =>{
  const { id:_id } =req.params;
  const user = await User.findByIdAndDelete(_id);
  if (!user) return next (new ErrorHandler("no user,INVALID id cannot be deleted",400))
  return res.status(200).json({
    message: "successfully deleted",
    user,
  })
});

