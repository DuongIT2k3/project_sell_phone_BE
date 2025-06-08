import { Router } from "express";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";


const router = Router()

router.use("/products", productRoutes)
router.use("/categories", categoryRoutes)

export default router