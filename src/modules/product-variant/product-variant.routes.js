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
import ProductVariantSchema from "./product-variant.schema.js";

const productVariantRoutes = Router();


productVariantRoutes.get("/", getListProductVariants);
productVariantRoutes.get("/:id", getProductVariantById);


productVariantRoutes.post("/", validBodyRequest(ProductVariantSchema), createProductVariant);


productVariantRoutes.patch("/:id", validBodyRequest(ProductVariantSchema.partial()), updateProductVariant);
productVariantRoutes.patch("/soft/:id", softDeleteProductVariant);
productVariantRoutes.patch("/restore/:id", restoreProductVariant);


productVariantRoutes.delete("/:id", deleteProductVariant);

export default productVariantRoutes;