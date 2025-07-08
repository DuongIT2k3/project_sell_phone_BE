import Product from "./product.model.js"
import handleAsync from "../../common/utils/handleAsync.js"
import createResponse from "../../common/utils/response.js"
import createError from "../../common/utils/error.js"
import MESSAGES from "../../common/constants/messages.js"
import ProductVariant from "../product-variant/product-variant.model.js"
import OrderProduct from "../order/order-product.model.js"
import CartProduct from "../cart/cart-product.model.js"
import mongoose from "mongoose"

export const createProduct = handleAsync( async (req, res, next) => {
    const { title, priceDefault, subCategory, brand } = req.body
    if(!title || !priceDefault || !subCategory || !brand) {
        return next(createError(400, MESSAGES.PRODUCT.MISSING_FIELDS))
    }
    const existing = await Product.findOne({ title: req.body.title })
    if(existing) return next(createError(400, MESSAGES.PRODUCT.CREATE_ERROR_EXISTS))
    const data = await Product.create(req.body)
    return res.json(createResponse(true, 201, MESSAGES.PRODUCT.CREATE_SUCCESS, data))
})

export const getListProduct = handleAsync(async (req,res,next) => {
    const { search, subCategory, brand, minPrice, maxPrice, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10,} = req.query;
    const query = { deletedAt: null, isActive: true}
    if(search){
        query.$text = { $search: search}
    }
    if(brand && mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand
    }
    if(subCategory && mongoose.Types.ObjectId.isValid(subCategory)) {
        query.subCategory = subCategory
    }
    if(minPrice || maxPrice){
        query.priceDefault = {};
        if(minPrice) query.priceDefault.$gte = Number(minPrice);
        if(maxPrice) query.priceDefault.$lte = Number(maxPrice);
    }
    const sortOptions = {};
    const validSortFields = ["priceDefault", "createdAt", "averageRating", "soldCount"];
    if(validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
        sortOptions.createdAt = -1;
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
        Product.find(query).sort(sortOptions).skip(skip).limit(limitNum), Product.countDocuments(query),
    ]);
    if(!products || products.length === 0) {
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    const totalPages = Math.ceil(total / limitNum);
    const data = {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
    };
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.GET_SUCCESS, {products, data}))
})

export const getDetailProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, MESSAGES.PRODUCT.INVALID_ID))
    const data = await Product.findById(id);
    if(!data){
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.GET_BY_ID_SUCCESS, data))
})

export const updateProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, MESSAGES.PRODUCT.INVALID_ID))
    const data = await Product.findByIdAndUpdate(id, req.body, {new: true})
    if(!data) {
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.UPDATE_SUCCESS, data))
})

export const deleteProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, MESSAGES.PRODUCT.INVALID_ID))
    const data = await Product.findById(id)
    if(!data) {
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    const hasVariants = await ProductVariant.findOne({productId: id})
    const inOrder = await OrderProduct.findOne({productId: id})
    const inCart = await CartProduct.findOne({productId: id})
    if(hasVariants || inOrder || inCart) {
        return next(createError(400, MESSAGES.PRODUCT.PRODUCT_IN_USE))
    }
    await Product.findByIdAndDelete(id);
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.DELETE_SUCCESS))
})

export const softDeleteProduct = handleAsync(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.PRODUCT.INVALID_ID))
    }
    const product = await Product.findById(id)
    if(!product){
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    const hasVariants = await ProductVariant.findOne({productId: id})
    const inOrder = await OrderProduct.findOne({productId: id})
    const inCart = await CartProduct.findOne({productId: id})
    if(hasVariants || inOrder || inCart) {
        return next(createError(400, MESSAGES.PRODUCT.PRODUCT_IN_USE))
    }
    const data = await Product.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true })
    if(!data) {
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.SOFT_DELETE_SUCCESS, data))
})

export const restoreProduct = handleAsync(async(req,res,next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, MESSAGES.PRODUCT.INVALID_ID))
    }
    const data = await Product.findByIdAndUpdate(id, { deletedAt: null, isActive: true }, { new: true })
    if(!data) {
        return next(createError(404, MESSAGES.PRODUCT.NOT_FOUND))
    }
    return res.json(createResponse(true, 200, MESSAGES.PRODUCT.RESTORE_SUCCESS, data))
})