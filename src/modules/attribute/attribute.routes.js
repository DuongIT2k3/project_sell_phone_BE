import { Router } from "express";
import { createAttribute, deleteAttribute, getAllAttributes, getAttributeById, restoreAttribute, softDeleteAttribute, updateAttribute } from "./attribute.controller";
import validBodyRequest from "../../common/middlewares/validBodyRequest";
import AttributeSchema from "./attribute.schema";

const attributeRoutes = Router();

attributeRoutes.get("/",getAllAttributes);
attributeRoutes.get("/:id", getAttributeById);

attributeRoutes.delete("/delete/:id", deleteAttribute);
attributeRoutes.patch("/soft-delete/:id", softDeleteAttribute);
attributeRoutes.patch("/restore/:id", restoreAttribute);

attributeRoutes.use(validBodyRequest(AttributeSchema));
attributeRoutes.patch("/:id", updateAttribute);
attributeRoutes.post("/", createAttribute);

export default attributeRoutes;