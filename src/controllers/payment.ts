import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount) return next(new ErrorHandler("please enter amount ", 404));
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });
  return res.status(201).json({
    status: true,
    message: ` price Successfully`,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;
  if (!code || !amount)
    return next(new ErrorHandler("please enter both coupon and amount", 404));

  const couponHai = await Coupon.create({ code, amount });
  return res.status(201).json({
    status: true,
    message: `Coupon ${code} Created Successfully`,
    coupon: couponHai,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;
  const couponCode = coupon as string;
  const discount = await Coupon.findOne({ code: couponCode });
  if (!discount) return next(new ErrorHandler("INVALID coupon code", 404));
  return res.status(200).json({
    success: true,
    discount: discount.amount,
    message: discount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});
  return res.status(200).json({
    status: [true, "success"],
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("no coupon", 404));
  return res.status(200).json({
    status: [true, "successfully deleted"],
    message: coupon?.code,
  });
});
