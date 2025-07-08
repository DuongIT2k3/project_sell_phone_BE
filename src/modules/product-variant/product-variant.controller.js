import ProductVariant from "./product-variant.model.js";
import Product from "../product/product.model.js";
import OrderProduct from "../order/order-product.model.js";
import cartProduct from "../cart/cart-product.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";

export const createProductVariant = handleAsync(async (req, res, next) => {
  const { productId, price, sku } = req.body;
  if (!productId || !price || !sku) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.MISSING_FIELDS));
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  const existingVariant = await ProductVariant.findOne({ sku });
  if (existingVariant) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_EXISTS));
  }
  const data = await ProductVariant.create(req.body);
  return res.json(createResponse(true, 201, MESSAGES.PRODUCT_VARIANT.CREATE_SUCCESS, data));
});

export const getListProductVariants = handleAsync(async (req, res, next) => {
  const { productId } = req.query;
  const query = productId ? { productId } : {};
  const data = await ProductVariant.find(query)
    .select("productId price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data || data.length === 0) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.GET_SUCCESS, data));
});

export const getProductVariantById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findById(id)
    .select("productId price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.DETAIL_SUCCESS, data));
});

export const updateProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const { sku } = req.body;
  if (sku) {
    const existingVariant = await ProductVariant.findOne({ sku, _id: { $ne: id } });
    if (existingVariant) {
      return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_EXISTS));
    }
  }
  const data = await ProductVariant.findByIdAndUpdate(id, req.body, { new: true })
    .select("productId price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.UPDATE_SUCCESS, data));
});

export const deleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findById(id);
  if (!variant) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  const inOrder = await OrderProduct.findOne({ productVariantId: id });
  const inCart = await cartProduct.findOne({ variantId: id });
  if (inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_EXISTS));
  }
  await ProductVariant.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.DELETE_SUCCESS, null));
});

export const softDeleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const variant = await ProductVariant.findById(id);
  if (!variant) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  const inOrder = await OrderProduct.findOne({ productVariantId: id });
  const inCart = await cartProduct.findOne({ variantId: id });
  if (inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.SKU_IN_CART));
  }
  const data = await ProductVariant.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT_VARIANT.SOFT_DELETE_SUCCESS, data));
});

export const restoreProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT_VARIANT.INVALID_ID));
  }
  const data = await ProductVariant.findByIdAndUpdate(
    id,
    { deletedAt: null },
    { new: true }
  )
    .select("productId price sku stock soldCount imageUrls")
    .populate("productId", "title");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT_VARIANT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200,  MESSAGES.PRODUCT_VARIANT.RESTORE_SUCCESS, data));
});