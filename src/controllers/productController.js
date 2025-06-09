import Product from "../models/Product.js"
import handleAsync from "../utils/handleAsync.js"
import createResponse from "../utils/response.js"
import createError from "../utils/error.js"

export const createProduct = handleAsync( async (req, res, next) => {
    const existing = await Product.findOne({ title: req.body.title })
    if(existing) return next(createError(400, "This product already exists!"))
    const data = await Product.create(req.body)
    return res.json(createResponse(true, 201, "Create Product successfully!", data))
})

export const getListProduct = handleAsync(async (req,res,next) => {
    const data = await Product.find()
    return res.json(createResponse(true, 200, "Get list product successfully!", data))
})

export const getDetailProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        const data = await Product.findById(id)
        return res.json(createResponse(true, 200, "Get detail product successfully!", data))
    }
    next(createError(false, 404, "Not found product!"))
})

export const updateProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        const data = await Product.findByIdAndUpdate(id, req.body)
        return res.json(createResponse(true, 200, "Update product successfully!", data))
    }
    next(createError(false, 404, "Product update failed!"))
})

export const deleteProduct = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        await Product.findByIdAndDelete(id)
        return res.json(createResponse(true, 200, "Delete successfully!"))
    }
    next(createError(false, 404, "Product delete failed!"))
})

export const softDeleteProduct = handleAsync(async(req, res, next) => {
    const {id} = req.params
    if(id){
        await Product.findByIdAndDelete(id, {
            deletedAt: new Date()
        })
        return res.json(createResponse(true, 200, "Hidden product successfully!"))
    }
    next(createError(false, 404, "Hidden product failed!"))
})

export const restoreProduct = handleAsync(async(req,res,next) => {
    const {id} = req.params
    if(id){
        await Product.findByIdAndUpdate(id, {
            deletedAt: null
        })
        return res.json(createResponse(true, 200, "Restore product successfully!"))
    }
    next(createError(false, 404, "Restore product failed!"))
})