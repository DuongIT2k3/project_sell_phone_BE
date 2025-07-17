import { Router } from "express";
import { 
    createCategory, 
    deleteCategory, 
    getDetailCategory, 
    getListCategory, 
    restoreCategory, 
    softDeleteCategory, 
    updateCategory 
} from "./category.controller.js";
import categorySchema, { categoryUpdateSchema } from "./category.schema.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import restrict from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";

const categoryRoutes = Router();


categoryRoutes.get("/", getListCategory);
categoryRoutes.get("/:id", getDetailCategory);


categoryRoutes.post("/", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(categorySchema), 
    createCategory
);

categoryRoutes.patch("/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(categoryUpdateSchema), 
    updateCategory
);


categoryRoutes.patch("/soft-delete/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    softDeleteCategory
);

categoryRoutes.patch("/restore/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    restoreCategory
);


categoryRoutes.delete("/:id", 
    verifyUser,
    restrict(["superAdmin", "admin"]), 
    deleteCategory
);

export default categoryRoutes;