import mongoose from "mongoose";
import Brand from "./brand.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";
import Product from "../product/product.model.js";

export const createBrand = handleAsync(async (req, res, next) => {
  const { title, slug } = req.body;
  if (!title || !slug) {
    return next(createError(400, MESSAGES.BRAND.MISSING_FIELDS));
  }
  
  const existing = await Brand.findOne({ $or: [{ title }, { slug }], deletedAt: null });
  if (existing) {
    return next(createError(400, MESSAGES.BRAND.CREATE_ERROR_EXISTS));
  }
  
  const data = await Brand.create({
    ...req.body,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return res.json(createResponse(true, 201, MESSAGES.BRAND.CREATE_SUCCESS, data));
});

export const getListBrand = handleAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [data, total] = await Promise.all([
    Brand.find({ deletedAt: null })
      .select("title logoUrl description slug seoTitle seoDescription isActive")
      .skip(skip)
      .limit(limitNum),
    Brand.countDocuments({ deletedAt: null })
  ]);
  
  if (!data || data.length === 0) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  
  const totalPages = Math.ceil(total / limitNum);
  const meta = { total, page: pageNum, limit: limitNum, totalPages };
  return res.json(createResponse(true, 200, MESSAGES.BRAND.GET_SUCCESS, { data, meta }));
});

export const getDetailBrand = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.BRAND.INVALID_ID));
  }
  const data = await Brand.findOne({ _id: id, deletedAt: null }).select(
    "title logoUrl description slug seoTitle seoDescription isActive"
  );
  if (!data) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.BRAND.GET_SUCCESS, data));
});

export const updateBrand = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, slug } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.BRAND.INVALID_ID));
  }
  
  // Check if brand exists
  const existingBrand = await Brand.findOne({ _id: id, deletedAt: null });
  if (!existingBrand) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  
  // Check title/slug uniqueness if provided
  if (title || slug) {
    const duplicateConditions = [];
    if (title) duplicateConditions.push({ title });
    if (slug) duplicateConditions.push({ slug });
    
    const existing = await Brand.findOne({
      $or: duplicateConditions,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (existing) {
      return next(createError(400, MESSAGES.BRAND.CREATE_ERROR_EXISTS));
    }
  }
  
  const data = await Brand.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  ).select("title logoUrl description slug seoTitle seoDescription isActive");
  
  return res.json(createResponse(true, 200, MESSAGES.BRAND.UPDATE_SUCCESS, data));
});

export const deleteBrand = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.BRAND.INVALID_ID));
  }
  const brand = await Brand.findOne({ _id: id, deletedAt: null });
  if (!brand) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  
  const product = await Product.findOne({ brand: id, deletedAt: null });
  if (product) {
    return next(createError(400, MESSAGES.BRAND.IN_USE));
  }
  
  await Brand.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.BRAND.DELETE_SUCCESS));
});

export const softDeleteBrand = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.BRAND.INVALID_ID));
  }
  const brand = await Brand.findOne({ _id: id, deletedAt: null });
  if (!brand) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  
  const product = await Product.findOne({ brand: id, deletedAt: null });
  if (product) {
    return next(createError(400, MESSAGES.BRAND.IN_USE));
  }
  
  const data = await Brand.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false, updatedAt: new Date() },
    { new: true }
  ).select("title logoUrl description slug seoTitle seoDescription isActive deletedAt");
  
  return res.json(createResponse(true, 200, MESSAGES.BRAND.SOFT_DELETE_SUCCESS, data));
});

export const restoreBrand = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.BRAND.INVALID_ID));
  }
  const data = await Brand.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true, updatedAt: new Date() },
    { new: true }
  ).select("title logoUrl description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.BRAND.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.BRAND.RESTORE_SUCCESS, data));
});
