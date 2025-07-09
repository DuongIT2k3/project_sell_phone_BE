import { Router } from "express";
import { createCategory, deleteCategory, getDetailCategory, getListCategory, restoreCategory, softDeleteCategory, updateCategory } from "./category.controller.js";
import categorySchema from "./category.schema.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import restrict from "../../common/middlewares/restrict.js";

const categoryRoutes = Router()


categoryRoutes.get("/", getListCategory)
categoryRoutes.get("/:id", getDetailCategory)

categoryRoutes.delete("/delete/:id",restrict(["superAdmin", "admin"]), deleteCategory)
categoryRoutes.patch("/soft-delete/:id",restrict(["superAdmin", "admin"]), softDeleteCategory)
categoryRoutes.patch("/restore/:id",restrict(["superAdmin", "admin"]), restoreCategory)

categoryRoutes.use(validBodyRequest(categorySchema));
categoryRoutes.patch("/:id",restrict(["superAdmin", "admin"]), updateCategory)
categoryRoutes.post("/",restrict(["superAdmin", "admin"]), createCategory)

export default categoryRoutes