import { Router } from "express";
import { createCategory, deleteCategory, getDetailCategory, getListCategory, softDeleteCategory, updateCategory } from "./category.controller.js";
import categorySchema from "./category.schema.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";

const categoryRoutes = Router()


categoryRoutes.get("/", getListCategory)
categoryRoutes.get("/:id", getDetailCategory)

categoryRoutes.delete("/:id", deleteCategory)
categoryRoutes.delete("/soft-delete/:id", softDeleteCategory)

categoryRoutes.use(validBodyRequest(categorySchema));
categoryRoutes.patch("/:id", updateCategory)
categoryRoutes.post("/", createCategory)

export default categoryRoutes