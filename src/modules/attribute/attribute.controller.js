import MESSAGES from "../../common/constants/messages.js";
import createError from "../../common/utils/error.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import AttributeValue from "../attribute-value/attribute-value.model.js";
import Attribute from "./attribute.model.js";
export const getAllAttributes = handleAsync(async (req, res, next) => {
  const attributes = await Attribute.find();
  if (!attributes || attributes.length === 0) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.GET_SUCCESS, attributes)
  );
});
export const createAttribute = handleAsync(async (req, res, next) => {
  const { name, attributeCode } = req.body;
  if (!name || !attributeCode) {
    return next(createError(400, MESSAGES.ATTRIBUTE.MISSING_FIELDS));
  }
  const existingAttribute = await Attribute.findOne({
    attributeCode: req.body.attributeCode,
  });
  if (existingAttribute)
    return next(createError(400, MESSAGES.ATTRIBUTE.CREATE_ERROR_EXISTS));
  const data = await Attribute.create(req.body);
  return res.json(
    createResponse(true, 201, MESSAGES.ATTRIBUTE.CREATE_SUCCESS, data)
  );
});
export const getAttributeById = handleAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.GET_SUCCESS, attribute)
  );
});
export const updateAttribute = handleAsync(async (req, res, next) => {
  const attribute = await Attribute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.UPDATE_ERROR));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.UPDATE_SUCCESS, attribute)
  );
});
export const deleteAttribute = handleAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  const attributeValue = await AttributeValue.findOne({ attributeId: req.params.id });
  if (attributeValue) {
    return next(createError(400, MESSAGES.ATTRIBUTE.IN_USE));
  }
  await Attribute.findByIdAndDelete(req.params.id);
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE.DELETE_SUCCESS));
});
export const softDeleteAttribute = handleAsync(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  const attributeValue = await AttributeValue.findOne({ attributeId: req.params.id });
  if (attributeValue) {
    return next(createError(400, MESSAGES.ATTRIBUTE.IN_USE));
  }
  const updatedAttribute = await Attribute.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!updatedAttribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE.SOFT_DELETE_SUCCESS, updatedAttribute));
});
export const restoreAttribute = handleAsync(async (req, res, next) => {
  const attribute = await Attribute.findOneAndUpdate(
    { _id: req.params.id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true },
    { new: true }
  );
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.RESTORE_SUCCESS, attribute)
  );
});
