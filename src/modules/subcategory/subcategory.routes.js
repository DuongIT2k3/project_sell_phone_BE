import { Router } from "express";
import {
	createSubCategory,
	deleteSubCategory,
	getDetailSubCategory,
	getListSubCategory,
	restoreSubCategory,
	softDeleteSubCategory,
	updateSubCategory,
} from "./subcategory.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import categorySchema from "./subcategory.schema.js";

const subCategoryRoutes = Router();

subCategoryRoutes.get("/", getListSubCategory);

subCategoryRoutes.get("/:id", getDetailSubCategory);
subCategoryRoutes.delete("/delete/:id", deleteSubCategory);
subCategoryRoutes.delete("/soft-delete/:id", softDeleteSubCategory);
subCategoryRoutes.patch("/restore/:id", restoreSubCategory);

subCategoryRoutes.use(validBodyRequest(categorySchema));
subCategoryRoutes.post("/", createSubCategory);
subCategoryRoutes.patch("/:id", updateSubCategory);

export default subCategoryRoutes;