import mongoose from "mongoose";


const schema = new mongoose.Schema({
  code:{
    type:String,
    required: [true,"please enter the coupon code"],
    // unique:true,s
  },
  amount:{
    type:Number,
    required: [true,"please enter the discount"],
  },

});



export const Coupon = mongoose.model("Coupon",schema);