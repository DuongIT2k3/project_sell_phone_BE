import mongoose from "mongoose";
import ProductVariant from "./product-variant.model.js";
import Product from "../product/product.model.js";
import OrderProduct from "../order/order-product.model.js";
import CartProduct from "../cart/cart-product.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";

export const createProductVariant = handleAsync(async (req, res, next) => {
  const { productId, color, capacity, price, sku } = req.body;
  if (!productId || !color || !capacity || !price || !sku) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.MISSING_FIELDS));
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_PRODUCT_ID));
  }
  
  const product = await Product.findOne({ _id: productId, deletedAt: null });
  if (!product) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.PRODUCT_NOT_FOUND));
  }
  
  const existingVariant = await ProductVariant.findOne({ sku, deletedAt: null });
  if (existingVariant) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_EXISTS));
  }
  
  const data = await ProductVariant.create({
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return res.json(createResponse(true, 201, MESSAGES.PRODUCT_VARIANT.CREATE_SUCCESS, data));
});

export const getListProductVariants = handleAsync(async (req, res, next) => {
  const { productId, color, capacity, page = 1, limit = 10 } = req.query;
  const query = { deletedAt: null };
  
  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_PRODUCT_ID));
    }
    query.productId = productId;
  }
  if (color) {
    if (!mongoose.Types.ObjectId.isValid(color)) {
      return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_COLOR_ID));
    }
    query.color = color;
  }
  if (capacity) {
    if (!mongoose.Types.ObjectId.isValid(capacity)) {
      return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_CAPACITY_ID));
    }
    query.capacity = capacity;
  }
  
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [data, total] = await Promise.all([
    ProductVariant.find(query)
      .select("productId color capacity price sku stock soldCount imageUrls oldPrice")
      .populate("productId", "title")
      .populate("color", "value")
      .populate("capacity", "value")
      .skip(skip)
      .limit(limitNum),
    ProductVariant.countDocuments(query)
  ]);
  
  if (!data || data.length === 0) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  
  const totalPages = Math.ceil(total / limitNum);
  const meta = { total, page: pageNum, limit: limitNum, totalPages };
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.GET_SUCCESS, { data, meta }));
});

export const getProductVariantById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findOne({ _id: id, deletedAt: null })
    .select("productId color capacity price sku stock soldCount imageUrls oldPrice")
    .populate("productId", "title")
    .populate("color", "value")
    .populate("capacity", "value");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.GET_SUCCESS, data));
});

export const updateProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { sku } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  
  // Check if variant exists
  const existingVariant = await ProductVariant.findOne({ _id: id, deletedAt: null });
  if (!existingVariant) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  
  // Check SKU uniqueness if it's being updated
  if (sku && sku !== existingVariant.sku) {
    const duplicateSku = await ProductVariant.findOne({ sku, _id: { $ne: id }, deletedAt: null });
    if (duplicateSku) {
      return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_EXISTS));
    }
  }
  
  const data = await ProductVariant.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  )
    .select("productId color capacity price sku stock soldCount imageUrls oldPrice")
    .populate("productId", "title")
    .populate("color", "value")
    .populate("capacity", "value");
  
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.UPDATE_SUCCESS, data));
});

export const deleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findOne({ _id: id, deletedAt: null });
  if (!variant) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  
  const [inOrder, inCart] = await Promise.all([
    OrderProduct.findOne({ productVariantId: id, deletedAt: null }),
    CartProduct.findOne({ variantId: id, deletedAt: null })
  ]);
  
  if (inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.VARIANT_IN_USE));
  }
  
  await ProductVariant.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.DELETE_SUCCESS));
});

export const softDeleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findOne({ _id: id, deletedAt: null });
  if (!variant) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  
  const [inOrder, inCart] = await Promise.all([
    OrderProduct.findOne({ productVariantId: id, deletedAt: null }),
    CartProduct.findOne({ variantId: id, deletedAt: null })
  ]);
  
  if (inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.VARIANT_IN_USE));
  }
  
  const data = await ProductVariant.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true }
  ).select("productId color capacity price sku stock soldCount imageUrls deletedAt");
  
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.SOFT_DELETE_SUCCESS, data));
});

export const restoreProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, updatedAt: new Date() },
    { new: true }
  )
    .select("productId color capacity price sku stock soldCount imageUrls oldPrice")
    .populate("productId", "title")
    .populate("color", "value")
    .populate("capacity", "value");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.RESTORE_SUCCESS, data));
});