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
import SubCategorySchema, { SubCategoryUpdateSchema } from "./subcategory.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const subCategoryRoutes = Router();


subCategoryRoutes.get("/", getListSubCategory);
subCategoryRoutes.get("/:id", getDetailSubCategory);


subCategoryRoutes.post("/", 
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(SubCategorySchema), 
  createSubCategory
);

subCategoryRoutes.patch("/:id", 
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(SubCategoryUpdateSchema), 
  updateSubCategory
);


subCategoryRoutes.patch("/soft-delete/:id", 
  restrict(["superAdmin", "admin"]), 
  softDeleteSubCategory
);

subCategoryRoutes.patch("/restore/:id", 
  restrict(["superAdmin", "admin"]), 
  restoreSubCategory
);


subCategoryRoutes.delete("/:id", 
  restrict(["superAdmin", "admin"]), 
  deleteSubCategory
);

export default subCategoryRoutes;