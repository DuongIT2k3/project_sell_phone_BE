import { Router } from "express";
import { createAttributeValue, deleteAttributeValue, getAttributeValueById, getAttributeValuesByAttributeId, restoreAttributeValue, softDeleteAttributeValue, updateAttributeValue } from "./attribute-value.controller";
import validBodyRequest from "../../common/middlewares/validBodyRequest";
import AttributeValueSchema from "./attribute-value.schema";

const attributeValueRoutes = Router();

attributeValueRoutes.get("/:attributeId", getAttributeValuesByAttributeId);
attributeValueRoutes.get("/:id", getAttributeValueById);


attributeValueRoutes.use();
attributeValueRoutes.delete("/delete/:id", deleteAttributeValue);
attributeValueRoutes.patch("/soft-delete/:id", softDeleteAttributeValue);
attributeValueRoutes.patch("/restore/:id", restoreAttributeValue);

attributeValueRoutes.use(validBodyRequest(AttributeValueSchema));
attributeValueRoutes.post("/:attributeId", validBodyRequest(AttributeValueSchema), createAttributeValue);
attributeValueRoutes.patch("/:id", updateAttributeValue);


export default attributeValueRoutes;