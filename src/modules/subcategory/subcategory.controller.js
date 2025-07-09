import SubCategory from "./subcategory.model.js";
import createError from "../../common/utils/error.js";
import createResponse from "../../common/utils/response.js";
import handleAsync from "../../common/utils/handleAsync.js";
import MESSAGES from "../../common/constants/messages.js";
import Category from "../category/category.model.js";
import Product from "../product/product.model.js";
import Banner from "../banner/banner.model.js";

export const createSubCategory = handleAsync(async (req, res, next) => {
	const {title, slug, parentCategoryId} = req.body;
	if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_PARENT_ID));
  }
  const category = await Category.findOne({ _id: parentCategoryId, deletedAt: null });
  if (!category) {
    return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
  }
  const existing = await SubCategory.findOne({ $or: [{ title }, { slug }], deletedAt: null });
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
	const { parentCategoryId } = req.query;
  const filter = { deletedAt: null };
  if (parentCategoryId) {
    if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
      return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_PARENT_ID));
    }
    filter.parentCategoryId = parentCategoryId;
  }
  const data = await SubCategory.find(filter).select(
    "parentCategoryId title logoUrl description slug seoTitle seoDescription isActive"
  );
  if (data.length === 0) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.GET_SUCCESS, data));
});

export const getDetailSubCategory = handleAsync(async (req, res, next) => {
	const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const data = await SubCategory.findOne({ _id: id, deletedAt: null }).select(
    "parentCategoryId title logoUrl description slug seoTitle seoDescription isActive"
  );
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
  if (parentCategoryId) {
    const category = await Category.findOne({ _id: parentCategoryId, deletedAt: null });
    if (!category) {
      return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
  }
  if (title || slug) {
    const existing = await SubCategory.findOne({
      $or: [{ title }, { slug }],
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
  ).select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
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
  const product = await Product.findOne({ subCategory: id, deletedAt: null });
  const banner = await Banner.findOne({ categoryId: id, deletedAt: null });
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
  const product = await Product.findOne({ subCategory: id, deletedAt: null });
  const banner = await Banner.findOne({ categoryId: id, deletedAt: null });
  if (product || banner) {
    return next(createError(400, MESSAGES.SUBCATEGORY.IN_USE));
  }
  const data = await SubCategory.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  ).select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive deletedAt");
  if (!data) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.SOFT_DELETE_SUCCESS, data));
});

export const restoreSubCategory = handleAsync(async (req, res, next) => {
	const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.SUBCATEGORY.INVALID_ID));
  }
  const data = await SubCategory.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true },
    { new: true }
  ).select("parentCategoryId title logoUrl description slug seoTitle seoDescription isActive");
  if (!data) {
    return next(createError(404, MESSAGES.SUBCATEGORY.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.SUBCATEGORY.RESTORE_SUCCESS, data));
});