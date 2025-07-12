import mongoose from "mongoose";
import Product from "./product.model.js";
import ProductVariant from "../product-variant/product-variant.model.js";
import OrderProduct from "../order/order-product.model.js";
import CartProduct from "../cart/cart-product.model.js";
import SubCategory from "../subcategory/subcategory.model.js";
import Brand from "../brand/brand.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";

export const createProduct = handleAsync(async (req, res, next) => {
  const { title, slug, priceDefault, subCategory, brand } = req.body;
  if (!title || !priceDefault || !subCategory || !brand) {
    return next(createError(400, MESSAGES.PRODUCT.MISSING_FIELDS));
  }
  if (!mongoose.Types.ObjectId.isValid(subCategory) || !mongoose.Types.ObjectId.isValid(brand)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_IDS));
  }
  const [existingProduct, subCategoryExists, brandExists] = await Promise.all([
    Product.findOne({ $or: [{ title }, { slug }], deletedAt: null }),
    SubCategory.findOne({ _id: subCategory, deletedAt: null }),
    Brand.findOne({ _id: brand, deletedAt: null }),
  ]);
  if (existingProduct) {
    return next(createError(400, MESSAGES.PRODUCT.CREATE_ERROR_EXISTS));
  }
  if (!subCategoryExists) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  if (!brandExists) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  const data = await Product.create({
    ...req.body,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return res.json(createResponse(true, 201, MESSAGES.PRODUCT.CREATE_SUCCESS, data));
});

export const getListProduct = handleAsync(async (req, res, next) => {
  const { search, brand, subCategory, minPrice, maxPrice, color, capacity, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;
  const query = { deletedAt: null, isActive: true };
  if (search) query.$text = { $search: search };
  if (brand && mongoose.Types.ObjectId.isValid(brand)) query.brand = brand;
  if (subCategory && mongoose.Types.ObjectId.isValid(subCategory)) query.subCategory = subCategory;
  if (minPrice || maxPrice) {
    query.priceDefault = {};
    if (minPrice) query.priceDefault.$gte = Number(minPrice);
    if (maxPrice) query.priceDefault.$lte = Number(maxPrice);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const aggregateQuery = [
    { $match: query },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subCategory",
      },
    },
    { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "productId",
        pipeline: [
          { $match: { deletedAt: null } },
          ...(color || capacity ? [{
            $match: {
              ...(color && mongoose.Types.ObjectId.isValid(color) ? { color } : {}),
              ...(capacity && mongoose.Types.ObjectId.isValid(capacity) ? { capacity } : {}),
            }
          }] : [])
        ],
        as: "variants",
      },
    },
    ...(color || capacity ? [{ $match: { "variants.0": { $exists: true } } }] : []),
    {
      $project: {
        title: 1,
        priceDefault: 1,
        subCategory: { title: "$subCategory.title", _id: "$subCategory._id" },
        brand: { title: "$brand.title", _id: "$brand._id" },
        description: 1,
        slug: 1,
        seoTitle: 1,
        seoDescription: 1,
        isActive: 1,
        thumbnail: 1,
        averageRating: 1,
        soldCount: 1,
        variantCount: { $size: "$variants" },
      },
    },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    { $skip: skip },
    { $limit: limitNum },
  ];

  const [products, total] = await Promise.all([
    Product.aggregate(aggregateQuery).exec(),
    Product.countDocuments(query),
  ]);

  if (products.length === 0) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }

  const totalPages = Math.ceil(total / limitNum);
  const meta = { total, page: pageNum, limit: limitNum, totalPages };
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.GET_SUCCESS, { products, meta }));
});

export const getDetailProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_ID));
  }
  const data = await Product.findOne({ _id: id, deletedAt: null })
    .populate("subCategory", "title _id")
    .populate("brand", "title _id")
    .select("title priceDefault subCategory brand description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.GET_BY_ID_SUCCESS, data));
});

export const updateProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, slug, subCategory, brand } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_ID));
  }
  if (subCategory && !mongoose.Types.ObjectId.isValid(subCategory)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_IDS));
  }
  if (brand && !mongoose.Types.ObjectId.isValid(brand)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_IDS));
  }
  if (title || slug) {
    const existing = await Product.findOne({
      $or: [{ title }, { slug }],
      _id: { $ne: id },
      deletedAt: null,
    });
    if (existing) {
      return next(createError(400, MESSAGES.PRODUCT.CREATE_ERROR_EXISTS));
    }
  }
  if (subCategory) {
    const subCategoryExists = await SubCategory.findOne({ _id: subCategory, deletedAt: null });
    if (!subCategoryExists) {
      return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
    }
  }
  if (brand) {
    const brandExists = await Brand.findOne({ _id: brand, deletedAt: null });
    if (!brandExists) {
      return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
    }
  }
  const data = await Product.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  ).select("title priceDefault subCategory brand description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.UPDATE_SUCCESS, data));
});

export const deleteProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_ID));
  }
  const product = await Product.findOne({ _id: id, deletedAt: null });
  if (!product) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  const [hasVariants, inOrder, inCart] = await Promise.all([
    ProductVariant.findOne({ productId: id, deletedAt: null }),
    OrderProduct.findOne({ productId: id, deletedAt: null }),
    CartProduct.findOne({ productId: id, deletedAt: null }),
  ]);
  if (hasVariants || inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT.PRODUCT_IN_USE));
  }
  await Product.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.DELETE_SUCCESS));
});

export const softDeleteProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_ID));
  }
  const product = await Product.findOne({ _id: id, deletedAt: null });
  if (!product) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  const [hasVariants, inOrder, inCart] = await Promise.all([
    ProductVariant.findOne({ productId: id, deletedAt: null }),
    OrderProduct.findOne({ productId: id, deletedAt: null }),
    CartProduct.findOne({ productId: id, deletedAt: null }),
  ]);
  if (hasVariants || inOrder || inCart) {
    return next(createError(400, MESSAGES.PRODUCT.PRODUCT_IN_USE));
  }
  const data = await Product.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  ).select("title priceDefault subCategory brand description slug seoTitle seoDescription isActive deletedAt");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.SOFT_DELETE_SUCCESS, data));
});

export const restoreProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.PRODUCT.INVALID_ID));
  }
  const data = await Product.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true, updatedAt: new Date() },
    { new: true }
  ).select("title priceDefault subCategory brand description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.PRODUCT.RESTORE_SUCCESS, data));
});