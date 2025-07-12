import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import  MESSAGES  from "../../common/constants/messages.js";
import News from "./news.model.js";
import User from "../user/user.model.js";
import mongoose from "mongoose";

// Lấy danh sách tin tức (public) - chỉ hiển thị tin đã publish
export const getPublishedNews = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, search, tags, author } = req.query;

    const skip = (page - 1) * limit;
    const query = { 
        deletedAt: null,
        isPublished: true 
    };

    // Search theo title, content, tags
    if (search) {
        query.$text = { $search: search };
    }

    // Filter theo tags
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
    }

    // Filter theo author
    if (author && mongoose.Types.ObjectId.isValid(author)) {
        query.authorId = author;
    }

    const [news, total] = await Promise.all([
        News.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    thumbnail: 1,
                    tags: 1,
                    slug: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    author: {
                        _id: { $arrayElemAt: ["$author._id", 0] },
                        name: { $arrayElemAt: ["$author.name", 0] },
                        email: { $arrayElemAt: ["$author.email", 0] }
                    },
                    // Excerpt từ content (200 ký tự đầu)
                    excerpt: { $substr: ["$content", 0, 200] }
                }
            },
            { $sort: { publishedAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]),
        News.countDocuments(query)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
    };

    return createResponse(res, 200, MESSAGES.NEWS.GET_SUCCESS, { news, meta });
});

// Lấy danh sách tin tức (admin) - hiển thị tất cả
export const getAllNews = handleAsync(async (req, res, next) => {
    const { page = 1, limit = 10, search, tags, author, isPublished } = req.query;

    const skip = (page - 1) * limit;
    const query = { deletedAt: null };

    // Search theo title, content, tags
    if (search) {
        query.$text = { $search: search };
    }

    // Filter theo tags
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
    }

    // Filter theo author
    if (author && mongoose.Types.ObjectId.isValid(author)) {
        query.authorId = author;
    }

    // Filter theo trạng thái publish
    if (isPublished !== undefined) {
        query.isPublished = isPublished === 'true';
    }

    const [news, total] = await Promise.all([
        News.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    seoTitle: 1,
                    seoDescription: 1,
                    thumbnail: 1,
                    tags: 1,
                    slug: 1,
                    isPublished: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    author: {
                        _id: { $arrayElemAt: ["$author._id", 0] },
                        name: { $arrayElemAt: ["$author.name", 0] },
                        email: { $arrayElemAt: ["$author.email", 0] }
                    },
                    excerpt: { $substr: ["$content", 0, 200] }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]),
        News.countDocuments(query)
    ]);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
    };

    return createResponse(res, 200, MESSAGES.NEWS.GET_SUCCESS, { news, meta });
});

// Lấy chi tiết tin tức theo slug (public)
export const getNewsBySlug = handleAsync(async (req, res, next) => {
    const { slug } = req.params;

    const news = await News.aggregate([
        {
            $match: {
                slug: slug,
                deletedAt: null,
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author"
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                seoTitle: 1,
                seoDescription: 1,
                thumbnail: 1,
                tags: 1,
                slug: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                    _id: { $arrayElemAt: ["$author._id", 0] },
                    name: { $arrayElemAt: ["$author.name", 0] },
                    email: { $arrayElemAt: ["$author.email", 0] }
                }
            }
        }
    ]);

    if (!news || news.length === 0) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    return createResponse(res, 200, MESSAGES.NEWS.GET_BY_SLUG_SUCCESS, news[0]);
});

// Lấy chi tiết tin tức theo ID (admin)
export const getNewsById = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.NEWS.INVALID_ID));
    }

    const news = await News.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                deletedAt: null
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author"
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                seoTitle: 1,
                seoDescription: 1,
                thumbnail: 1,
                tags: 1,
                slug: 1,
                isPublished: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                    _id: { $arrayElemAt: ["$author._id", 0] },
                    name: { $arrayElemAt: ["$author.name", 0] },
                    email: { $arrayElemAt: ["$author.email", 0] }
                }
            }
        }
    ]);

    if (!news || news.length === 0) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    return createResponse(res, 200, MESSAGES.NEWS.GET_BY_ID_SUCCESS, news[0]);
});

// Tạo tin tức mới
export const createNews = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { 
        title, 
        content, 
        seoTitle, 
        seoDescription, 
        thumbnail, 
        tags, 
        slug,
        isPublished = false
    } = req.body;

    // Kiểm tra slug đã tồn tại
    const existingNews = await News.findOne({ slug, deletedAt: null });
    if (existingNews) {
        return next(createError(400, MESSAGES.NEWS.SLUG_EXISTS));
    }

    const news = await News.create({
        title,
        content,
        seoTitle,
        seoDescription,
        authorId: user._id,
        thumbnail,
        tags: tags || [],
        slug,
        isPublished
    });

    return createResponse(res, 201, MESSAGES.NEWS.CREATE_SUCCESS, news);
});

// Cập nhật tin tức
export const updateNews = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const { 
        title, 
        content, 
        seoTitle, 
        seoDescription, 
        thumbnail, 
        tags, 
        slug,
        isPublished
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.NEWS.INVALID_ID));
    }

    const news = await News.findOne({ _id: id, deletedAt: null });
    if (!news) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    // Kiểm tra slug đã tồn tại (trừ tin tức hiện tại)
    if (slug && slug !== news.slug) {
        const existingNews = await News.findOne({ 
            slug, 
            deletedAt: null,
            _id: { $ne: id }
        });
        if (existingNews) {
            return next(createError(400, MESSAGES.NEWS.SLUG_EXISTS));
        }
    }

    // Cập nhật các field
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (tags !== undefined) updateData.tags = tags;
    if (slug !== undefined) updateData.slug = slug;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedNews = await News.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    return createResponse(res, 200, MESSAGES.NEWS.UPDATE_SUCCESS, updatedNews);
});

// Xóa mềm tin tức
export const deleteNews = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.NEWS.INVALID_ID));
    }

    const news = await News.findOne({ _id: id, deletedAt: null });
    if (!news) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    news.deletedAt = new Date();
    await news.save();

    return createResponse(res, 200, MESSAGES.NEWS.DELETE_SUCCESS, null);
});

// Khôi phục tin tức đã xóa
export const restoreNews = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.NEWS.INVALID_ID));
    }

    const news = await News.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!news) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    news.deletedAt = null;
    await news.save();

    return createResponse(res, 200, MESSAGES.NEWS.RESTORE_SUCCESS, news);
});

// Publish/Unpublish tin tức
export const togglePublishStatus = handleAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.NEWS.INVALID_ID));
    }

    const news = await News.findOne({ _id: id, deletedAt: null });
    if (!news) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    news.isPublished = !news.isPublished;
    await news.save();

    const statusMessage = news.isPublished ? 
        MESSAGES.NEWS.PUBLISH_SUCCESS : 
        MESSAGES.NEWS.UNPUBLISH_SUCCESS;

    return createResponse(res, 200, statusMessage, news);
});

// Lấy tin tức liên quan (cùng tags)
export const getRelatedNews = handleAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { limit = 5 } = req.query;

    // Tìm tin tức hiện tại
    const currentNews = await News.findOne({ slug, deletedAt: null, isPublished: true });
    if (!currentNews) {
        return next(createError(404, MESSAGES.NEWS.NOT_FOUND));
    }

    // Tìm tin tức liên quan cùng tags
    const relatedNews = await News.aggregate([
        {
            $match: {
                _id: { $ne: currentNews._id },
                deletedAt: null,
                isPublished: true,
                tags: { $in: currentNews.tags }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author"
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                seoTitle: 1,
                thumbnail: 1,
                slug: 1,
                publishedAt: 1,
                author: {
                    name: { $arrayElemAt: ["$author.name", 0] }
                },
                excerpt: { $substr: ["$content", 0, 150] }
            }
        },
        { $sort: { publishedAt: -1 } },
        { $limit: parseInt(limit) }
    ]);

    return createResponse(res, 200, MESSAGES.NEWS.GET_RELATED_SUCCESS, relatedNews);
});
