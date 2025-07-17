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
import { verifyUser } from "../../common/middlewares/verifyUser.js";

const subCategoryRoutes = Router();


subCategoryRoutes.get("/", getListSubCategory);
subCategoryRoutes.get("/:id", getDetailSubCategory);


subCategoryRoutes.post("/", 
  verifyUser,
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(SubCategorySchema), 
  createSubCategory
);

subCategoryRoutes.patch("/:id", 
  verifyUser,
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(SubCategoryUpdateSchema), 
  updateSubCategory
);


subCategoryRoutes.patch("/soft-delete/:id", 
  verifyUser,
  restrict(["superAdmin", "admin"]), 
  softDeleteSubCategory
);

subCategoryRoutes.patch("/restore/:id", 
  verifyUser,
  restrict(["superAdmin", "admin"]), 
  restoreSubCategory
);


subCategoryRoutes.delete("/:id", 
  verifyUser,
  restrict(["superAdmin", "admin"]), 
  deleteSubCategory
);

export default subCategoryRoutes;