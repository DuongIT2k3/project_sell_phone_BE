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
import SubCategorySchema from "./subcategory.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const subCategoryRoutes = Router();

subCategoryRoutes.get("/", getListSubCategory);

subCategoryRoutes.get("/:id", getDetailSubCategory);
subCategoryRoutes.delete("/delete/:id",restrict(["superAdmin", "admin"]), deleteSubCategory);
subCategoryRoutes.patch("/soft-delete/:id",restrict(["superAdmin", "admin"]), softDeleteSubCategory);
subCategoryRoutes.patch("/restore/:id",restrict(["superAdmin", "admin"]), restoreSubCategory);

subCategoryRoutes.use(validBodyRequest(SubCategorySchema));
subCategoryRoutes.post("/",restrict(["superAdmin", "admin"]), createSubCategory);
subCategoryRoutes.patch("/:id",restrict(["superAdmin", "admin"]), updateSubCategory);

export default subCategoryRoutes;