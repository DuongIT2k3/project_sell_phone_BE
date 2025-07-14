import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import  MESSAGES  from "../../common/constants/messages.js";
import Banner from "./banner.model.js";
import Product from "../product/product.model.js";
import Category from "../category/category.model.js";
import mongoose from "mongoose";

// Lấy danh sách banner với phân trang và filter
export const getListBanner = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, isActive, categoryId, search } = req.query;

    const skip = (page - 1) * limit;
    const query = { deletedAt: null };

    // Filter theo trạng thái active
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    // Filter theo category
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        query.categoryId = categoryId;
    }

    // Search theo title
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    const [banners, total] = await Promise.all([
        Banner.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId", 
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    order: 1,
                    slug: 1,
                    isActive: 1,
                    imageUrl: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    product: {
                        _id: { $arrayElemAt: ["$product._id", 0] },
                        name: { $arrayElemAt: ["$product.name", 0] },
                        slug: { $arrayElemAt: ["$product.slug", 0] }
                    },
                    category: {
                        _id: { $arrayElemAt: ["$category._id", 0] },
                        name: { $arrayElemAt: ["$category.name", 0] },
                        slug: { $arrayElemAt: ["$category.slug", 0] }
                    }
                }
            },
            { $sort: { order: 1, createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]),
        Banner.countDocuments(query)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
    };

    return createResponse(res, 200, MESSAGES.BANNER.GET_SUCCESS, { banners, meta });
});

// Lấy thông tin chi tiết banner theo ID
export const getBannerById = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_ID));
    }

    const banner = await Banner.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                deletedAt: null
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id", 
                as: "category"
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                order: 1,
                slug: 1,
                isActive: 1,
                imageUrl: 1,
                createdAt: 1,
                updatedAt: 1,
                product: {
                    _id: { $arrayElemAt: ["$product._id", 0] },
                    name: { $arrayElemAt: ["$product.name", 0] },
                    slug: { $arrayElemAt: ["$product.slug", 0] },
                    images: { $arrayElemAt: ["$product.images", 0] }
                },
                category: {
                    _id: { $arrayElemAt: ["$category._id", 0] },
                    name: { $arrayElemAt: ["$category.name", 0] },
                    slug: { $arrayElemAt: ["$category.slug", 0] }
                }
            }
        }
    ]);

    if (!banner || banner.length === 0) {
        return next(createError(404, MESSAGES.BANNER.NOT_FOUND));
    }

    return createResponse(res, 200, MESSAGES.BANNER.GET_BY_ID_SUCCESS, banner[0]);
});

// Tạo banner mới
export const createBanner = handleAsync(async (req, res, next) => {
    const { title, description, order, slug, productId, categoryId, isActive, imageUrl } = req.body;

    // Validate product tồn tại
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_PRODUCT_ID));
    }

    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) {
        return next(createError(404, MESSAGES.BANNER.PRODUCT_NOT_FOUND));
    }

    // Validate category tồn tại
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_CATEGORY_ID));
    }

    const category = await Category.findOne({ _id: categoryId, deletedAt: null });
    if (!category) {
        return next(createError(404, MESSAGES.BANNER.CATEGORY_NOT_FOUND));
    }

    // Kiểm tra slug đã tồn tại
    const existingBanner = await Banner.findOne({ slug, deletedAt: null });
    if (existingBanner) {
        return next(createError(400, MESSAGES.BANNER.SLUG_EXISTS));
    }

    const banner = await Banner.create({
        title,
        description,
        order: order || 0,
        slug,
        productId,
        categoryId,
        isActive: isActive !== undefined ? isActive : true,
        imageUrl
    });

    return createResponse(res, 201, MESSAGES.BANNER.CREATE_SUCCESS, banner);
});

// Cập nhật banner
export const updateBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, order, slug, productId, categoryId, isActive, imageUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_ID));
    }

    const banner = await Banner.findOne({ _id: id, deletedAt: null });
    if (!banner) {
        return next(createError(404, MESSAGES.BANNER.NOT_FOUND));
    }

    // Validate product nếu có thay đổi
    if (productId && productId !== banner.productId.toString()) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(createError(400, MESSAGES.BANNER.INVALID_PRODUCT_ID));
        }

        const product = await Product.findOne({ _id: productId, deletedAt: null });
        if (!product) {
            return next(createError(404, MESSAGES.BANNER.PRODUCT_NOT_FOUND));
        }
    }

    // Validate category nếu có thay đổi
    if (categoryId && categoryId !== banner.categoryId.toString()) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return next(createError(400, MESSAGES.BANNER.INVALID_CATEGORY_ID));
        }

        const category = await Category.findOne({ _id: categoryId, deletedAt: null });
        if (!category) {
            return next(createError(404, MESSAGES.BANNER.CATEGORY_NOT_FOUND));
        }
    }

    // Kiểm tra slug đã tồn tại (trừ banner hiện tại)
    if (slug && slug !== banner.slug) {
        const existingBanner = await Banner.findOne({ 
            slug, 
            deletedAt: null,
            _id: { $ne: id }
        });
        if (existingBanner) {
            return next(createError(400, MESSAGES.BANNER.SLUG_EXISTS));
        }
    }

    // Cập nhật các field
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (slug !== undefined) updateData.slug = slug;
    if (productId !== undefined) updateData.productId = productId;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedBanner = await Banner.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    return createResponse(res, 200, MESSAGES.BANNER.UPDATE_SUCCESS, updatedBanner);
});

// Xóa mềm banner
export const deleteBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_ID));
    }

    const banner = await Banner.findOne({ _id: id, deletedAt: null });
    if (!banner) {
        return next(createError(404, MESSAGES.BANNER.NOT_FOUND));
    }

    banner.deletedAt = new Date();
    await banner.save();

    return createResponse(res, 200, MESSAGES.BANNER.DELETE_SUCCESS, null);
});

// Khôi phục banner đã xóa
export const restoreBanner = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_ID));
    }

    const banner = await Banner.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!banner) {
        return next(createError(404, MESSAGES.BANNER.NOT_FOUND));
    }

    banner.deletedAt = null;
    await banner.save();

    return createResponse(res, 200, MESSAGES.BANNER.RESTORE_SUCCESS, banner);
});

// Cập nhật trạng thái active/inactive
export const toggleBannerStatus = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.BANNER.INVALID_ID));
    }

    const banner = await Banner.findOne({ _id: id, deletedAt: null });
    if (!banner) {
        return next(createError(404, MESSAGES.BANNER.NOT_FOUND));
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    const statusMessage = banner.isActive ? 
        MESSAGES.BANNER.ACTIVATE_SUCCESS : 
        MESSAGES.BANNER.DEACTIVATE_SUCCESS;

    return createResponse(res, 200, statusMessage, banner);
});
