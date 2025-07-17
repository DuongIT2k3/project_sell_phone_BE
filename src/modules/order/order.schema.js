import { z } from "zod";

// Schema cho việc tạo đơn hàng
export const createOrderSchema = z.object({
    phoneNumber: z.string()
        .min(1, "Số điện thoại là bắt buộc")
        .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
    addressId: z.string()
        .min(1, "Địa chỉ là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "ID địa chỉ không hợp lệ"),
    note: z.string()
        .max(500, "Ghi chú không được vượt quá 500 ký tự")
        .optional(),
    paymentMethod: z.enum(["PAYOS", "COD"])
        .optional()
        .default("PAYOS"),
    shippingFee: z.number()
        .min(0, "Phí ship phải lớn hơn hoặc bằng 0")
        .optional()
        .default(0),
    discountAmount: z.number()
        .min(0, "Số tiền giảm giá phải lớn hơn hoặc bằng 0")
        .optional()
        .default(0)
});

// Schema cho query params của getUserOrders
export const getOrdersQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, "Page phải là số")
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, "Limit phải là số")
        .optional(),
    status: z.enum([
        "Pending",
        "Processing", 
        "Shipping",
        "Delivered",
        "Cancelled"
    ]).optional()
});

// Schema cho cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "Pending",
        "Processing", 
        "Shipping",
        "Delivered",
        "Cancelled"
    ], {
        required_error: "Trạng thái đơn hàng là bắt buộc",
        invalid_type_error: "Trạng thái đơn hàng không hợp lệ"
    }),
    note: z.string()
        .max(500, "Ghi chú không được vượt quá 500 ký tự")
        .optional()
});
