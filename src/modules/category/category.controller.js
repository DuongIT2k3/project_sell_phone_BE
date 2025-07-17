import mongoose from "mongoose";
import Category from "./category.model.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";
import Banner from "../banner/banner.model.js";
import SubCategory from "../subcategory/subcategory.model.js";

export const createCategory = handleAsync(async (req, res, next) => {
    const { title, slug } = req.body;
    if (!title || !slug) {
        return next(createError(400, MESSAGES.CATEGORY.MISSING_FIELDS));
    }
    
    const existing = await Category.findOne({ $or: [{ title }, { slug }], deletedAt: null });
    if (existing) return next(createError(400, MESSAGES.CATEGORY.CREATE_ERROR_EXISTS));
    
    const data = await Category.create({
        ...req.body,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return res.json(createResponse(true, 201, MESSAGES.CATEGORY.CREATE_SUCCESS, data));
});

export const getListCategory = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const [data, total] = await Promise.all([
        Category.find({ deletedAt: null })
            .select("title logoUrl description slug seoTitle seoDescription isActive")
            .skip(skip)
            .limit(limitNum),
        Category.countDocuments({ deletedAt: null })
    ]);
    
    const totalPages = Math.ceil(total / limitNum);
    const meta = { total, page: pageNum, limit: limitNum, totalPages };
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.GET_SUCCESS, { data: data || [], meta }));
});

export const getDetailCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.CATEGORY.INVALID_ID));
    }
    const data = await Category.findOne({ _id: id, deletedAt: null }).select(
        "title logoUrl description slug seoTitle seoDescription isActive"
    );
    if (!data) {
        return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.GET_SUCCESS, data));
});

export const updateCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, slug } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.CATEGORY.INVALID_ID));
    }
    
    // Check if category exists
    const existingCategory = await Category.findOne({ _id: id, deletedAt: null });
    if (!existingCategory) {
        return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
    
    // Check title/slug uniqueness if provided
    if (title || slug) {
        const duplicateConditions = [];
        if (title) duplicateConditions.push({ title });
        if (slug) duplicateConditions.push({ slug });
        
        const existing = await Category.findOne({
            $or: duplicateConditions,
            _id: { $ne: id },
            deletedAt: null,
        });
        if (existing) {
            return next(createError(400, MESSAGES.CATEGORY.CREATE_ERROR_EXISTS));
        }
    }
    
    const data = await Category.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { ...req.body, updatedAt: new Date() },
        { new: true }
    ).select("title logoUrl description slug seoTitle seoDescription isActive");
    
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.UPDATE_SUCCESS, data));
});

export const deleteCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.CATEGORY.INVALID_ID));
    }
    const category = await Category.findOne({ _id: id, deletedAt: null });
    if (!category) {
        return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
    
    const [subCategory, banner] = await Promise.all([
        SubCategory.findOne({ parentCategoryId: id, deletedAt: null }),
        Banner.findOne({ categoryId: id, deletedAt: null })
    ]);
    
    if (subCategory || banner) {
        return next(createError(400, MESSAGES.CATEGORY.IN_USE));
    }
    
    await Category.findByIdAndDelete(id);
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.DELETE_SUCCESS));
});

export const softDeleteCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.CATEGORY.INVALID_ID));
    }
    const category = await Category.findOne({ _id: id, deletedAt: null });
    if (!category) {
        return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
    
    const [subCategory, banner] = await Promise.all([
        SubCategory.findOne({ parentCategoryId: id, deletedAt: null }),
        Banner.findOne({ categoryId: id, deletedAt: null })
    ]);
    
    if (subCategory || banner) {
        return next(createError(400, MESSAGES.CATEGORY.IN_USE));
    }
    
    const data = await Category.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), isActive: false, updatedAt: new Date() },
        { new: true }
    ).select("title logoUrl description slug seoTitle seoDescription isActive deletedAt");
    
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.SOFT_DELETE_SUCCESS, data));
});

export const restoreCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.CATEGORY.INVALID_ID));
    }
    const data = await Category.findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } },
        { deletedAt: null, isActive: true, updatedAt: new Date() },
        { new: true }
    ).select("title logoUrl description slug seoTitle seoDescription isActive");
    if (!data) {
        return next(createError(404, MESSAGES.CATEGORY.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.CATEGORY.RESTORE_SUCCESS, data));
});