import { Router } from "express";
import { deleteCart, getCart, updateCart, clearCart, addToCart } from "./cart.controller.js";
import  validBodyRequest  from "../../common/middlewares/validBodyRequest.js";
import { updateCartSchema, deleteCartSchema, addToCartSchema } from "./cart.schema.js";

const cartRouter = Router();

cartRouter.post("/", validBodyRequest(addToCartSchema), addToCart);
cartRouter.patch("/", validBodyRequest(updateCartSchema), updateCart);
cartRouter.get("/", getCart);
cartRouter.delete("/", validBodyRequest(deleteCartSchema), deleteCart);
cartRouter.delete("/clear", clearCart);

export default cartRouter;