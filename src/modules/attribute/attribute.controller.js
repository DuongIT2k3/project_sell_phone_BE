import mongoose from "mongoose";
import MESSAGES from "../../common/constants/messages.js";
import createError from "../../common/utils/error.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import AttributeValue from "../attribute-value/attribute-value.model.js";
import Attribute from "./attribute.model.js";

export const getAllAttributes = handleAsync(async (req, res, next) => {
  const attributes = await Attribute.find({ deletedAt: null }).select("attributeName attributeCode description type enumValues isActive");
  if (!attributes || attributes.length === 0) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.GET_SUCCESS, attributes)
  );
});

export const createAttribute = handleAsync(async (req, res, next) => {
  const { attributeName, attributeCode, type, enumValues } = req.body;
  if (!attributeName || !attributeCode || !type) {
    return next(createError(400, MESSAGES.ATTRIBUTE.MISSING_FIELDS));
  }
  if (type === "enum" && (!enumValues || !Array.isArray(enumValues) || enumValues.length === 0)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ENUM_VALUES));
  }
  const existingAttribute = await Attribute.findOne({ attributeCode, deletedAt: null });
  if (existingAttribute) {
    return next(createError(400, MESSAGES.ATTRIBUTE.CREATE_ERROR_EXISTS));
  }
  const data = await Attribute.create(req.body);
  return res.json(
    createResponse(true, 201, MESSAGES.ATTRIBUTE.CREATE_SUCCESS, data)
  );
});

export const getAttributeById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  const attribute = await Attribute.findOne({ _id: id, deletedAt: null }).select(
    "attributeName attributeCode description type enumValues isActive"
  );
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.GET_SUCCESS, attribute)
  );
});

export const updateAttribute = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { attributeCode, type, enumValues } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  if (attributeCode) {
    const existingAttribute = await Attribute.findOne({
      attributeCode,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (existingAttribute) {
      return next(createError(400, MESSAGES.ATTRIBUTE.CREATE_ERROR_EXISTS));
    }
  }
  if (type === "enum" && (!enumValues || !Array.isArray(enumValues) || enumValues.length === 0)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ENUM_VALUES));
  }
  const attribute = await Attribute.findOneAndUpdate(
    { _id: id, deletedAt: null },
    req.body,
    { new: true }
  ).select("attributeName attributeCode description type enumValues isActive");
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.UPDATE_SUCCESS, attribute)
  );
});

export const deleteAttribute = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  const attribute = await Attribute.findById(id);
  if (!attribute || attribute.deletedAt) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  const attributeValue = await AttributeValue.findOne({ attributeId: id, deletedAt: null });
  if (attributeValue) {
    return next(createError(400, MESSAGES.ATTRIBUTE.IN_USE));
  }
  await Attribute.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE.DELETE_SUCCESS));
});

export const softDeleteAttribute = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  const attribute = await Attribute.findById(id);
  if (!attribute || attribute.deletedAt) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  const attributeValue = await AttributeValue.findOne({ attributeId: id, deletedAt: null });
  if (attributeValue) {
    return next(createError(400, MESSAGES.ATTRIBUTE.IN_USE));
  }
  const updatedAttribute = await Attribute.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  ).select("attributeName attributeCode description type enumValues isActive deletedAt");
  if (!updatedAttribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.SOFT_DELETE_SUCCESS, updatedAttribute)
  );
});

export const restoreAttribute = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  const attribute = await Attribute.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true },
    { new: true }
  ).select("attributeName attributeCode description type enumValues isActive");
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  return res.json(
    createResponse(true, 200, MESSAGES.ATTRIBUTE.RESTORE_SUCCESS, attribute)
  );
});