import { Router } from "express";
import productRoutes from "../modules/product/product.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import subCategoryRoutes from "../modules/subcategory/subcategory.routes.js";
import authRouter from "../modules/auth/auth.router.js";
import { verifyUser } from "../common/middlewares/verifyUser.js";
import cartRouter from "../modules/cart/cart.routes.js";
import productVariantRoutes from "../modules/product-variant/product-variant.routes.js";
import attributeRoutes from "../modules/attribute/attribute.routes.js";
import attributeValueRoutes from "../modules/attribute-value/attribute-value.routes.js";
import orderRouter from "../modules/order/order.router.js";


const router = Router()

router.use("/products", productRoutes)
router.use("/categories", categoryRoutes)
router.use("/sub-categories", subCategoryRoutes);
router.use("/auth", authRouter);

router.use("/product-variant", productVariantRoutes);
router.use("/cart", verifyUser,cartRouter);
router.use("/attribute", attributeRoutes);
router.use("/attribute-value",attributeValueRoutes);

router.use("/order", orderRouter);

export default router