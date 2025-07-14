import mongoose from "mongoose";
import MESSAGES from "../../common/constants/messages.js";
import createError from "../../common/utils/error.js";
import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import Attribute from "../attribute/attribute.model.js";
import AttributeValue from "./attribute-value.model.js";

export const getAttributeValuesByAttributeId = handleAsync(async (req, res, next) => {
  const { attributeId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(attributeId)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  const attribute = await Attribute.findOne({ _id: attributeId, deletedAt: null });
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  const attributeValues = await AttributeValue.find({ attributeId, deletedAt: null }).select(
    "attributeId value valueCode isActive"
  );
  if (!attributeValues || attributeValues.length === 0) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValues));
});

export const createAttributeValue = handleAsync(async (req, res, next) => {
  const { attributeId } = req.params;
  const { value, valueCode } = req.body;
  if (!mongoose.Types.ObjectId.isValid(attributeId)) {
    return next(createError(400, MESSAGES.ATTRIBUTE.INVALID_ID));
  }
  if (!value || !valueCode) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.MISSING_FIELDS));
  }
  
  const attribute = await Attribute.findOne({ _id: attributeId, deletedAt: null });
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  
  // Validate enum value before checking duplicates
  if (attribute.type === "enum" && !attribute.enumValues.includes(value)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_VALUE));
  }
  
  const existingAttributeValue = await AttributeValue.findOne({
    attributeId,
    $or: [{ value }, { valueCode }],
    deletedAt: null,
  });
  if (existingAttributeValue) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.CREATE_ERROR_EXISTS));
  }
  
  const data = await AttributeValue.create({ ...req.body, attributeId });
  return res.json(createResponse(true, 201, MESSAGES.ATTRIBUTE_VALUE.CREATE_SUCCESS, data));
});

export const getAttributeValueById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_ID));
  }
  const attributeValue = await AttributeValue.findOne({ _id: id, deletedAt: null }).select(
    "attributeId value valueCode isActive"
  );
  if (!attributeValue) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValue));
});

export const updateAttributeValue = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { value, valueCode } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_ID));
  }
  
  // First, get the current AttributeValue to get attributeId
  const currentAttributeValue = await AttributeValue.findOne({ _id: id, deletedAt: null });
  if (!currentAttributeValue) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  
  // Validate enum value if value is being updated
  if (value) {
    const attribute = await Attribute.findById(currentAttributeValue.attributeId);
    if (attribute?.type === "enum" && !attribute.enumValues.includes(value)) {
      return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_VALUE));
    }
  }
  
  // Check for duplicates if value or valueCode is being updated
  if (value || valueCode) {
    const duplicateConditions = [];
    if (value) duplicateConditions.push({ value });
    if (valueCode) duplicateConditions.push({ valueCode });
    
    const existingAttributeValue = await AttributeValue.findOne({
      attributeId: currentAttributeValue.attributeId,
      $or: duplicateConditions,
      _id: { $ne: id },
      deletedAt: null,
    });
    if (existingAttributeValue) {
      return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.CREATE_ERROR_EXISTS));
    }
  }
  
  const attributeValue = await AttributeValue.findOneAndUpdate(
    { _id: id, deletedAt: null },
    req.body,
    { new: true }
  ).select("attributeId value valueCode isActive");
  
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.UPDATE_SUCCESS, attributeValue));
});

export const deleteAttributeValue = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_ID));
  }
  const attributeValue = await AttributeValue.findOne({ _id: id, deletedAt: null });
  if (!attributeValue) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  await AttributeValue.findByIdAndDelete(id);
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.DELETE_SUCCESS));
});

export const softDeleteAttributeValue = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_ID));
  }
  const attributeValue = await AttributeValue.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  ).select("attributeId value valueCode isActive deletedAt");
  if (!attributeValue) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.SOFT_DELETE_SUCCESS, attributeValue));
});

export const restoreAttributeValue = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ATTRIBUTE_VALUE.INVALID_ID));
  }
  const attributeValue = await AttributeValue.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, isActive: true },
    { new: true }
  ).select("attributeId value valueCode isActive");
  if (!attributeValue) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.RESTORE_SUCCESS, attributeValue));
});

export const getAttributeValuesByAttributeCode = handleAsync(async (req, res, next) => {
  const { attributeCode } = req.params;
  if (!attributeCode || attributeCode.trim() === "") {
    return next(createError(400, MESSAGES.ATTRIBUTE.MISSING_FIELDS));
  }
  
  const attribute = await Attribute.findOne({ attributeCode, deletedAt: null });
  if (!attribute) {
    return next(createError(404, MESSAGES.ATTRIBUTE.NOT_FOUND));
  }
  
  const attributeValues = await AttributeValue.find({ attributeId: attribute._id, deletedAt: null }).select(
    "attributeId value valueCode isActive"
  );
  if (!attributeValues || attributeValues.length === 0) {
    return next(createError(404, MESSAGES.ATTRIBUTE_VALUE.NOT_FOUND));
  }
  return res.json(createResponse(true, 200, MESSAGES.ATTRIBUTE_VALUE.GET_SUCCESS, attributeValues));
});