import { Router } from "express";
import { createProduct, deleteProduct, getDetailProduct, getListProduct, restoreProduct, softDeleteProduct, updateProduct } from "./product.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import ProductSchema from "./product.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const productRoutes = Router()

productRoutes.get("/", getListProduct)
productRoutes.get("/:id", getDetailProduct)

productRoutes.delete("/:id",restrict(["superAdmin", "admin"]), deleteProduct)
productRoutes.patch("/soft-delete/:id",restrict(["superAdmin", "admin"]), softDeleteProduct)
productRoutes.patch("/restore/:id",restrict(["superAdmin", "admin"]), restoreProduct)

productRoutes.use(validBodyRequest(ProductSchema))
productRoutes.post("/",restrict(["superAdmin", "admin"]), createProduct)
productRoutes.patch("/:id",restrict(["superAdmin", "admin"]), updateProduct)

export default productRoutes