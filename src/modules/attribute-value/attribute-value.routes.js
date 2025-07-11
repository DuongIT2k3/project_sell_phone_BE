import { Router } from "express";
import { createAttributeValue, deleteAttributeValue, getAttributeValueById, getAttributeValuesByAttributeCode, getAttributeValuesByAttributeId, restoreAttributeValue, softDeleteAttributeValue, updateAttributeValue } from "./attribute-value.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import AttributeValueSchema from "./attribute-value.schema.js";
import  restrict  from "../../common/middlewares/restrict.js";

const attributeValueRoutes = Router();

attributeValueRoutes.get("/attribute/:attributeId", getAttributeValuesByAttributeId);
attributeValueRoutes.get("/code/:attributeCode", getAttributeValuesByAttributeCode);
attributeValueRoutes.get("/:id", getAttributeValueById);


attributeValueRoutes.delete("/delete/:id",restrict(["superAdmin", "admin"]), deleteAttributeValue);
attributeValueRoutes.patch("/soft-delete/:id",restrict(["superAdmin", "admin"]), softDeleteAttributeValue);
attributeValueRoutes.patch("/restore/:id",restrict(["superAdmin", "admin"]), restoreAttributeValue);

attributeValueRoutes.use(validBodyRequest(AttributeValueSchema));
attributeValueRoutes.post("/:attributeId",restrict(["superAdmin", "admin"]), createAttributeValue);
attributeValueRoutes.patch("/:id",restrict(["superAdmin", "admin"]), updateAttributeValue);


export default attributeValueRoutes;