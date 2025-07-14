import { Router } from "express";
import { deleteCart, getCart, updateCart, clearCart } from "./cart.controller.js";
import  validBodyRequest  from "../../common/middlewares/validBodyRequest.js";
import { updateCartSchema, deleteCartSchema } from "./cart.schema.js";

const cartRouter = Router();

cartRouter.patch("/", validBodyRequest(updateCartSchema), updateCart);
cartRouter.get("/", getCart);
cartRouter.delete("/", validBodyRequest(deleteCartSchema), deleteCart);
cartRouter.delete("/clear", clearCart);

export default cartRouter;