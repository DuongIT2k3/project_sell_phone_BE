import Category from "../models/Category.js"
import handleAsync from "../utils/handleAsync.js"
import createResponse from "../utils/response.js"
import createError from "../utils/error.js"

export const createCategory = handleAsync( async (req, res, next) => {
    const existing = await Category.findOne({ title: req.body.title })
    if(existing) return next(createError(400, "This category already exists!"))
    const data = await Category.create(req.body)
    return res.json(createResponse(true, 201, "Create Category successfully!", data))
})

export const getListCategory = handleAsync(async (req,res,next) => {
    const data = await Category.find()
    return res.json(createResponse(true, 200, "Get List category successfully!", data))
})

export const getDetailCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        const data = await Category.findById(id)
        return res.json(createResponse(true, 200, "Get detail category successfully!", data))
    }
    next(createError(false, 404, "Not found category!"))
})

export const updateCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        const data = await Category.findByIdAndUpdate(id, req.body)
        return res.json(createResponse(true, 200, "Update category successfully!", data))
    }
    next(createError(false, 404, "Category update failed!"))
})

export const deleteCategory = handleAsync(async (req, res, next) => {
    const { id } = req.params
    if(id){
        await Category.findByIdAndDelete(id)
        return res.json(createResponse(true, 200, "Delete successfully!"))
    }
    next(createError(false, 404, "Category delete failed!"))
})

export const softDeleteCategory = handleAsync(async(req, res, next) => {
    const {id} = req.params
    if(id){
        await Category.findByIdAndDelete(id, {
            deletedAt: new Date()
        })
        return res.json(createCategory(true, 200, "Hidden category successfully!"))
    }
    next(createError(false, 404, "Hidden category failed!"))
})

export const restoreCategory = handleAsync(async(req,res,next) => {
    const {id} = req.params
    if(id){
        await Category.findByIdAndUpdate(id, {
            deletedAt: null
        })
        return res.json(createCategory(true, 200, "Restore category successfully!"))
    }
    next(createError(false, 404, "Restore category failed!"))
})