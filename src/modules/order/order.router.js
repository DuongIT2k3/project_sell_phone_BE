import { Router } from "express";
import { createOrder } from "./order.controller.js";

const orderRouter = Router();

orderRouter.post("/createOrder", createOrder);

export default orderRouter;