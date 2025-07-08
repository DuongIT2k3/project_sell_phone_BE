import { Router } from "express"
import { deleteCart, getCart, updateCart } from "./cart.controller.js";

const cartRouter = Router();

cartRouter.patch("/", updateCart);
cartRouter.get("/", getCart);
cartRouter.delete("/", deleteCart);

export default cartRouter;