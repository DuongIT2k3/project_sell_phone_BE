import { Router } from "express";
import { createProduct, deleteProduct, getDetailProduct, getListProduct, restoreProduct, softDeleteProduct, updateProduct } from "./product.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import ProductSchema from "./product.schema.js";

const productRoutes = Router()

productRoutes.get("/", getListProduct)
productRoutes.get("/:id", getDetailProduct)

productRoutes.delete("/:id", deleteProduct)
productRoutes.patch("/soft-delete/:id", softDeleteProduct)
productRoutes.patch("/restore/:id", restoreProduct)

productRoutes.use(validBodyRequest(ProductSchema))
productRoutes.post("/", createProduct)
productRoutes.patch("/:id", updateProduct)

export default productRoutes