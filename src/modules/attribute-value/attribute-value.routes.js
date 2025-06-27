import { Router } from "express";
import { createAttributeValue, deleteAttributeValue, getAttributeValueById, getAttributeValuesByAttributeCode, getAttributeValuesByAttributeId, restoreAttributeValue, softDeleteAttributeValue, updateAttributeValue } from "./attribute-value.controller";
import validBodyRequest from "../../common/middlewares/validBodyRequest";
import AttributeValueSchema from "./attribute-value.schema";

const attributeValueRoutes = Router();

attributeValueRoutes.get("/attribute/:attributeId", getAttributeValuesByAttributeId);
attributeValueRoutes.get("/code/:attributeCode", getAttributeValuesByAttributeCode);
attributeValueRoutes.get("/:id", getAttributeValueById);


attributeValueRoutes.delete("/delete/:id", deleteAttributeValue);
attributeValueRoutes.patch("/soft-delete/:id", softDeleteAttributeValue);
attributeValueRoutes.patch("/restore/:id", restoreAttributeValue);

attributeValueRoutes.use(validBodyRequest(AttributeValueSchema));
attributeValueRoutes.post("/:attributeId", createAttributeValue);
attributeValueRoutes.patch("/:id", updateAttributeValue);


export default attributeValueRoutes;