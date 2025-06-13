import { Router } from "express";
import { createProduct, deleteProduct, getDetailProduct, getListProduct, updateProduct } from "./product.controller.js";

const productRoutes = Router()

productRoutes.get("/", getListProduct)
productRoutes.get("/:id", getDetailProduct)
productRoutes.post("/", createProduct)
productRoutes.patch("/:id", updateProduct)
productRoutes.delete("/:id", deleteProduct)

export default productRoutes