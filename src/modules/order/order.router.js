import { Router } from "express";
import {
  createOrder,
  paymentWebhook,
  checkPaymentStatus,
  getUserOrders,
  getOrderById,
  cancelOrder
} from "./order.controller.js";
import  validBodyRequest  from "../../common/middlewares/validBodyRequest.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";
import { createOrderSchema } from "./order.schema.js";

const orderRouter = Router();


orderRouter.post("/webhook", paymentWebhook);


orderRouter.use(verifyUser);

orderRouter.post("/", validBodyRequest(createOrderSchema), createOrder);
orderRouter.get("/", getUserOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.patch("/:id/cancel", cancelOrder);
orderRouter.get("/payment-status/:orderCode", checkPaymentStatus);

export default orderRouter;