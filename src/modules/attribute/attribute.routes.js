import { Router } from "express";
import { createAttribute, deleteAttribute, getAllAttributes, getAttributeById, restoreAttribute, softDeleteAttribute, updateAttribute } from "./attribute.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import AttributeSchema from "./attribute.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const attributeRoutes = Router();

attributeRoutes.get("/",getAllAttributes);
attributeRoutes.get("/:id", getAttributeById);

attributeRoutes.delete("/delete/:id",restrict(["superAdmin", "admin"]), deleteAttribute);
attributeRoutes.patch("/soft-delete/:id",restrict(["superAdmin", "admin"]), softDeleteAttribute);
attributeRoutes.patch("/restore/:id",restrict(["superAdmin", "admin"]), restoreAttribute);

attributeRoutes.use(validBodyRequest(AttributeSchema));
attributeRoutes.patch("/:id",restrict(["superAdmin", "admin"]), updateAttribute);
attributeRoutes.post("/",restrict(["superAdmin", "admin"]), createAttribute);

export default attributeRoutes;