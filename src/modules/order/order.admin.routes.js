import { Router } from "express";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  getOrderStatistics
} from "./order.controller.js";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import restrict from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";
import { updateOrderStatusSchema } from "./order.schema.js";

const orderAdminRouter = Router();

// Tất cả routes đều cần authentication và admin role
orderAdminRouter.use(verifyUser);
orderAdminRouter.use(restrict(["admin", "superAdmin"]));

// Lấy tất cả đơn hàng với filters và pagination
orderAdminRouter.get("/", getAllOrders);

// Thống kê đơn hàng
orderAdminRouter.get("/statistics", getOrderStatistics);

// Lấy chi tiết đơn hàng
orderAdminRouter.get("/:id", getOrderByIdAdmin);

// Cập nhật trạng thái đơn hàng
orderAdminRouter.patch("/:id/status", validBodyRequest(updateOrderStatusSchema), updateOrderStatus);

export default orderAdminRouter;
