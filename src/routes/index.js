import { Router } from "express";
import productRoutes from "../modules/product/product.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import subCategoryRoutes from "../modules/subcategory/subcategory.routes.js";
import authRouter from "../modules/auth/auth.router.js";


const router = Router()

router.use("/products", productRoutes)
router.use("/categories", categoryRoutes)
router.use("/sub-categories", subCategoryRoutes);
router.use("/auth", authRouter);

export default router