import mongoose from "mongoose";
import SubCategory from "./subcategory.model.js";
import createError from "../../common/utils/error.js";
import createResponse from "../../common/utils/response.js";
import handleAsync from "../../common/utils/handleAsync.js";
import MESSAGES from "../../common/constants/messages.js";
import Category from "../category/category.model.js";
import Product from "../product/product.model.js";
import Banner from "../banner/banner.model.js";

export const createSubCategory = handleAsync(async (req, res, next) => {
  const { title, slug, parentCategoryId } = req.body;
  if (!title || !slug || !parentCategoryId) {
    return next(createError(400, MESSAGES.SUBCATEGORY.MISSING_FIELDS));
  }
  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_PARENT_ID));
  }
  
  const [category, existing] = await Promise.all([
    Category.findOne({ _id: parentCategoryId, deletedAt: null }),
    SubCategory.findOne({ $or: [{ title }, { slug }], deletedAt: null })
  ]);
  
  if (!category) {
    return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
  }
  if (existing) {
    return next(createError(400, MESSAGES.SUBCATEGORY.CREATE_ERROR_EXISTS));
  }
  
  const data = await SubCategory.create({
    ...req.body,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return res.json(createResponse(true, 201, MESSAGES.SUBCATEGORY.CREATE_SUCCESS, data));
});


export const getListSubCategory = handleAsync(async (req, res, next) => {
  const { parentCategoryId, page = 1, limit = 10 } = req.query;
  const filter = { deletedAt: null };
  
  if (parentCategoryId) {
    if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
      return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_PARENT_ID));
    }
    filter.parentCategoryId = parentCategoryId;
  }
  
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const [data, total] = await Promise.all([
    SubCategory.find(filter)
      .select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive")
      .populate("parentCategoryId", "title")
      .skip(skip)
      .limit(limitNum),
    SubCategory.countDocuments(filter)
  ]);
  
  if (data.length === 0) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  
  const totalPages = Math.ceil(total / limitNum);
  const meta = { total, page: pageNum, limit: limitNum, totalPages };
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.GET_SUCCESS, { data, meta }));
});

export const getDetailSubCategory = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const data = await SubCategory.findOne({ _id: id, deletedAt: null })
    .select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive")
    .populate("parentCategoryId", "title");
  if (!data) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.GET_SUCCESS, data));
});

export const updateSubCategory = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, slug, parentCategoryId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  if (parentCategoryId && !mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_PARENT_ID));
  }
  
  // Check if subcategory exists
  const existingSubCategory = await SubCategory.findOne({ _id: id, deletedAt: null });
  if (!existingSubCategory) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  
  // Validate parent category if provided
  if (parentCategoryId) {
    const category = await Category.findOne({ _id: parentCategoryId, deletedAt: null });
    if (!category) {
      return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
  }
  
  // Check title/slug uniqueness if provided
  if (title || slug) {
    const duplicateConditions = [];
    if (title) duplicateConditions.push({ title });
    if (slug) duplicateConditions.push({ slug });
    
    const existing = await SubCategory.findOne({
      $or: duplicateConditions,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (existing) {
      return next(createError(400, MESSAGES.SUBCATEGORY.CREATE_ERROR_EXISTS));
    }
  }
  
  const data = await SubCategory.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  )
    .select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive")
    .populate("parentCategoryId", "title");
  
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.UPDATE_SUCCESS, data));
});

export const deleteSubCategory = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const subCategory = await SubCategory.findOne({ _id: id, deletedAt: null });
  if (!subCategory) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  
  const [product, banner] = await Promise.all([
    Product.findOne({ subCategory: id, deletedAt: null }),
    Banner.findOne({ categoryId: id, deletedAt: null })
  ]);
  
  if (product || banner) {
    return next(createError(400, MESSAGES.SUBCATEGORY.IN_USE));
  }
  
  await SubCategory.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.DELETE_SUCCESS));
});

export const softDeleteSubCategory = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const subCategory = await SubCategory.findOne({ _id: id, deletedAt: null });
  if (!subCategory) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  
  const [product, banner] = await Promise.all([
    Product.findOne({ subCategory: id, deletedAt: null }),
    Banner.findOne({ categoryId: id, deletedAt: null })
  ]);
  
  if (product || banner) {
    return next(createError(400, MESSAGES.SUBCATEGORY.IN_USE));
  }
  
  const data = await SubCategory.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false, updatedAt: new Date() },
    { new: true }
  ).select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive deletedAt");
  
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.SOFT_DELETE_SUCCESS, data));
});

export const restoreSubCategory = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const data = await SubCategory.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true, updatedAt: new Date() },
    { new: true }
  )
    .select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive")
    .populate("parentCategoryId", "title");
  if (!data) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.RESTORE_SUCCESS, data));
});