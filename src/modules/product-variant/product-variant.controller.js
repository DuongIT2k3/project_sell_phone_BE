import ProductVariant from "./product-variant.model.js";
import Product from "../product/product.model.js";
import OrderProduct from "../order/order-product.model.js";
import cartProduct from "../cart/cart-product.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGE from "../../common/constants/messages.js";

export const createProductVariant = handleAsync(async (req, res, next) => {
  const { productId, color, capacity, price, sku } = req.body;
  if (!productId || !color || !capacity || !price || !sku) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.MISSING_FIELDS));
  }
  const product = await Product.findById(productId);
  if (!product || product.deletedAt) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.PRODUCT_NOT_FOUND));
  }
  const existingVariant = await ProductVariant.findOne({ sku });
  if (existingVariant) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.SKU_EXISTS));
  }
  const data = await ProductVariant.create(req.body);
  return res.json(createResponse(true, 201, MESSAGE.PRODUCT_VARIANT.CREATE_SUCCESS, data));
});

export const getListProductVariants = handleAsync(async (req, res, next) => {
  const { productId, color, capacity } = req.query;
  const query = { deletedAt: null };
  if (productId) query.productId = productId;
  if (color) query.color = color;
  if (capacity) query.capacity = capacity;
  const data = await ProductVariant.find(query)
    .select("productId color capacity price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data || data.length === 0) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.GET_SUCCESS, data));
});

export const getProductVariantById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findById(id)
    .select("productId color capacity price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data || data.deletedAt) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.GET_SUCCESS, data));
});

export const updateProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.INVALID_ID));
  }
  const { sku } = req.body;
  if (sku) {
    const existingVariant = await ProductVariant.findOne({ sku, _id: { $ne: id } });
    if (existingVariant) {
      return next(createError(400, MESSAGE.PRODUCT_VARIANT.SKU_EXISTS));
    }
  }
  const data = await ProductVariant.findByIdAndUpdate(id, req.body, { new: true })
    .select("productId color capacity price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data || data.deletedAt) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.UPDATE_SUCCESS, data));
});

export const deleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findById(id);
  if (!variant || variant.deletedAt) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  const inOrder = await OrderProduct.findOne({ productVariantId: id });
  const inCart = await cartProduct.findOne({ variantId: id });
  if (inOrder || inCart) {
    return next(createError(400,MESSAGE.PRODUCT_VARIANT.SKU_IN_CART));
  }
  await ProductVariant.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.DELETE_SUCCESS, null));
});

export const softDeleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findById(id);
  if (!variant || variant.deletedAt) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  const inOrder = await OrderProduct.findOne({ productVariantId: id });
  const inCart = await cartProduct.findOne({ variantId: id });
  if (inOrder || inCart) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.SKU_IN_CART));
  }
  const data = await ProductVariant.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
  if (!data) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.SOFT_DELETE_SUCCESS, data));
});

export const restoreProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGE.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findByIdAndUpdate(
    id,
    { deletedAt: null },
    { new: true }
  )
    .select("productId color capacity price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data) {
    return next(createError(404, MESSAGE.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGE.PRODUCT_VARIANT.RESTORE_SUCCESS, data));
});