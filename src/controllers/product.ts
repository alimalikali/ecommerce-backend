import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.js";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: 1 }).limit(5);

    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    status: "success",
    message: "product latest",
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    status: "success",
    message: "getAllCategories",
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }
  return res.status(200).json({
    status: "success",
    message: "getAllCategories",
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  let product;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("invalid id", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    status: "success",
    message: "getSingleProduct",
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, category, stock, price } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("invalid id", 404));

  // if (!photo)  return next (new ErrorHandler("please give photo",400));
  if (photo) {
    rm(product.photo!, () => {
      console.log("old photo deleted");
    });
    product.photo = photo.path;
  }
  if (name) product.name = name;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save(); // Corrected this

  invalidateCache({ product: true,  admin: true, productId:String(product._id)});

  return res.status(200).json({
    status: "success",
    message: "product updated successully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) return next(new ErrorHandler("invalid id", 404));
  rm(product.photo!, () => {
    console.log("product photo deleted");
  });
  invalidateCache({ product: true, admin: true, productId:String(product._id)});
  return res.status(200).json({
    status: "success",
    message: "deleted",
    product,
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};
    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;
    const productPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      status: "success",
      message: "getAllProducts",
      totalPage,
      products,
    });
  }
);

export const newProduct = TryCatch(async (req, res, next) => {
  const { name, category, stock, price } = req.body;
  const photo = req.file;

  if (!photo) return next(new ErrorHandler("please give photo", 400));
  if (!name || !category || !stock || !price) {
    rm(photo.path, () => {
      console.log("deleted");
    });
    return next(new ErrorHandler("please add all feilds", 400));
  }
  await Product.create({
    name,
    category: category.toLowerCase(),
    stock,
    price,
    photo: photo.path,
  });
     
  invalidateCache({ product: true , admin: true,});

  return res.status(200).json({
    status: "success",
    message: "product created successully",
  });
});

//   export const singleUpload = TryCatch(
//     async ( req, res, next) => {
//         const products = await Product.find(req.params.id);
//       return res.status(200).json({
//           status: "success",
//           message: "getAllCategories",
//           products
//       })
//     }
//   );
