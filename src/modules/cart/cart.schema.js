import { z } from "zod";

// Schema cho việc thêm/cập nhật sản phẩm trong giỏ hàng
export const updateCartSchema = z.object({
    productId: z.string()
        .min(1, "Product ID là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "Product ID không hợp lệ"),
    variantId: z.string()
        .min(1, "Variant ID là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "Variant ID không hợp lệ"),
    quantity: z.number()
        .min(1, "Số lượng phải lớn hơn 0")
        .max(100, "Số lượng không được vượt quá 100")
});

// Schema cho việc xóa sản phẩm khỏi giỏ hàng
export const deleteCartSchema = z.object({
    cartProductId: z.string()
        .min(1, "Cart Product ID là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "Cart Product ID không hợp lệ"),
    removeAll: z.boolean().optional().default(false)
});
