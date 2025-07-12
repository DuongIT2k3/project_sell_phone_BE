import { Router } from "express";
import { 
    createBrand, 
    deleteBrand, 
    getDetailBrand, 
    getListBrand, 
    restoreBrand, 
    softDeleteBrand, 
    updateBrand 
} from "./brand.controller.js";
import BrandSchema, { BrandUpdateSchema } from "./brand.schema.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import restrict from "../../common/middlewares/restrict.js";

const brandRoutes = Router();


brandRoutes.get("/", getListBrand);
brandRoutes.get("/:id", getDetailBrand);


brandRoutes.post("/", 
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(BrandSchema), 
    createBrand
);

brandRoutes.patch("/:id", 
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(BrandUpdateSchema), 
    updateBrand
);


brandRoutes.patch("/soft-delete/:id", 
    restrict(["superAdmin", "admin"]), 
    softDeleteBrand
);

brandRoutes.patch("/restore/:id", 
    restrict(["superAdmin", "admin"]), 
    restoreBrand
);


brandRoutes.delete("/:id", 
    restrict(["superAdmin", "admin"]), 
    deleteBrand
);

export default brandRoutes;
