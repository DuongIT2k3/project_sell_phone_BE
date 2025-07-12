import { Router } from "express";
import { 
    createAttribute, 
    deleteAttribute, 
    getAllAttributes, 
    getAttributeById, 
    restoreAttribute, 
    softDeleteAttribute, 
    updateAttribute 
} from "./attribute.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import AttributeSchema from "./attribute.schema.js";
import restrict from "../../common/middlewares/restrict.js";

const attributeRoutes = Router();


attributeRoutes.get("/", getAllAttributes);
attributeRoutes.get("/:id", getAttributeById);


attributeRoutes.post("/", 
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(AttributeSchema), 
    createAttribute
);

attributeRoutes.patch("/:id", 
    restrict(["superAdmin", "admin"]), 
    validBodyRequest(AttributeSchema), 
    updateAttribute
);


attributeRoutes.patch("/soft-delete/:id", 
    restrict(["superAdmin", "admin"]), 
    softDeleteAttribute
);

attributeRoutes.patch("/restore/:id", 
    restrict(["superAdmin", "admin"]), 
    restoreAttribute
);

// Hard delete operation
attributeRoutes.delete("/:id", 
    restrict(["superAdmin", "admin"]), 
    deleteAttribute
);

export default attributeRoutes;