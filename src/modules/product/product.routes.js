import { Router } from "express";
import { 
    createProduct, 
    deleteProduct, 
    getDetailProduct, 
    getListProduct,
    getAllProductsForAdmin,
    restoreProduct, 
    softDeleteProduct, 
    updateProduct 
} from "./product.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import ProductSchema, { ProductUpdateSchema } from "./product.schema.js";
import restrict from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";

const productRoutes = Router();


productRoutes.get("/", getListProduct);
productRoutes.get("/admin/all", verifyUser, restrict(["superAdmin", "admin"]), getAllProductsForAdmin);
productRoutes.get("/:id", getDetailProduct);

productRoutes.post("/", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(ProductSchema), 
    createProduct
);

productRoutes.patch("/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(ProductUpdateSchema), 
    updateProduct
);


productRoutes.patch("/soft-delete/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    softDeleteProduct
);

productRoutes.patch("/restore/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    restoreProduct
);


productRoutes.delete("/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    deleteProduct
);

export default productRoutes;