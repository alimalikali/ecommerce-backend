import express from "express";
import cors from "cors";



import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import Stripe from "stripe";
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/orders.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";



import {config} from "dotenv";
import morgan from "morgan";


import NodeCache from "node-cache";

config({
  path:"./.env"
})
const PORT = process.env.PORT||  5000;
const mongoURI= process.env.MONGO_URI || "";
const stripeKey= process.env.STRIPE_KEY || "";

connectDB(mongoURI);

export const stripe = new Stripe(stripeKey);

export const myCache= new NodeCache({});


const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API working with api/v1");
});
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);








app.use("/uploads",express.static("uploads"));
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
