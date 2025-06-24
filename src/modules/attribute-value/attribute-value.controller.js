import MESSAGES from "../../common/constants/messages.js";
import createError from "../../common/utils/error";
import handleAsync from "../../common/utils/handleAsync";
import createResponse from "../../common/utils/response";
import AttributeValue from "./attribute-value.model.js";

export const getAttributeValuesByAttributeId = handleAsync(async (req, res, next) => {
    const { attributeId } = req.params;
    const attributeValues = await AttributeValue.find({ attributeId });
    if (!attributeValues || attributeValues.length === 0) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValues));
});
export const createAttributeValue = handleAsync(async (req, res, next) => {
    const { attributeId } = req.params;
    const existingAttributeValue = await AttributeValue.findOne({
        attributeId,
        value: req.body.value
    });
    if (existingAttributeValue) {
        return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.CREATE_ERROR_EXISTS));
    }
    const data = await AttributeValue.create({ ...req.body, attributeId });
    return res.json(createResponse(true, 201, MESSAGES.ATTRIBUTE_VALUE.CREATE_SUCCESS, data));
});
export const getAttributeValueById = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const attributeValue = await AttributeValue.findById(id);
    if (!attributeValue) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValue));
});
export const updateAttributeValue = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const attributeValue = await AttributeValue.findByIdAndUpdate(id, req.body, { new: true });
    if (!attributeValue) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.UPDATE_ERROR));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.UPDATE_SUCCESS, attributeValue));
});
export const deleteAttributeValue = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const attributeValue = await AttributeValue.findByIdAndDelete(id);
    if (!attributeValue) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.DELETE_ERROR));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.DELETE_SUCCESS));
});
export const softDeleteAttributeValue = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const attributeValue = await AttributeValue.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
    );
    if (!attributeValue) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.SOFT_DELETE_SUCCESS, attributeValue));
});
export const restoreAttributeValue = handleAsync(async (req, res, next) => {
    const { id } = req.params;
    const attributeValue = await AttributeValue.findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } },
        { deletedAt: null },    
        { new: true }
    );
    if (!attributeValue) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.RESTORE_SUCCESS, attributeValue));
});
export const getAttributeValuesByAttributeCode = handleAsync(async (req, res, next) => {
    const { attributeCode } = req.params;
    const attributeValues = await AttributeValue.find({ attributeCode });
    if (!attributeValues || attributeValues.length === 0) {
        return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
    }
    return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValues));
});