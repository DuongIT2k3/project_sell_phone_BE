import { Router } from "express";
import {
  createProductVariant,
  deleteProductVariant,
  getListProductVariants,
  getProductVariantById,
  softDeleteProductVariant,
  restoreProductVariant,
  updateProductVariant,
} from "./product-variant.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import ProductVariantSchema, { ProductVariantUpdateSchema } from "./product-variant.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const productVariantRoutes = Router();


productVariantRoutes.get("/", getListProductVariants);
productVariantRoutes.get("/:id", getProductVariantById);


productVariantRoutes.post("/", 
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(ProductVariantSchema), 
  createProductVariant
);

productVariantRoutes.patch("/:id", 
  restrict(["superAdmin", "admin"]), 
  validBodyRequest(ProductVariantUpdateSchema), 
  updateProductVariant
);


productVariantRoutes.patch("/soft-delete/:id", 
  restrict(["superAdmin", "admin"]), 
  softDeleteProductVariant
);

productVariantRoutes.patch("/restore/:id", 
  restrict(["superAdmin", "admin"]), 
  restoreProductVariant
);


productVariantRoutes.delete("/:id", 
  restrict(["superAdmin", "admin"]), 
  deleteProductVariant
);

export default productVariantRoutes;