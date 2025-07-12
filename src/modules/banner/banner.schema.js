import { z } from "zod";

// Schema cho việc tạo banner mới
export const createBannerSchema = z.object({
    title: z.string()
        .min(1, "Tiêu đề banner là bắt buộc")
        .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
    description: z.string()
        .max(500, "Mô tả không được vượt quá 500 ký tự")
        .optional(),
    order: z.number()
        .int("Thứ tự phải là số nguyên")
        .min(0, "Thứ tự phải lớn hơn hoặc bằng 0")
        .optional(),
    slug: z.string()
        .min(1, "Slug là bắt buộc")
        .max(100, "Slug không được vượt quá 100 ký tự")
        .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
    productId: z.string()
        .min(1, "Product ID là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "Product ID không hợp lệ"),
    categoryId: z.string()
        .min(1, "Category ID là bắt buộc")
        .regex(/^[0-9a-fA-F]{24}$/, "Category ID không hợp lệ"),
    isActive: z.boolean().optional(),
    imageUrl: z.string()
        .min(1, "URL hình ảnh là bắt buộc")
        .url("URL hình ảnh không hợp lệ")
});

// Schema cho việc cập nhật banner
export const updateBannerSchema = z.object({
    title: z.string()
        .min(1, "Tiêu đề banner là bắt buộc")
        .max(200, "Tiêu đề không được vượt quá 200 ký tự")
        .optional(),
    description: z.string()
        .max(500, "Mô tả không được vượt quá 500 ký tự")
        .optional(),
    order: z.number()
        .int("Thứ tự phải là số nguyên")
        .min(0, "Thứ tự phải lớn hơn hoặc bằng 0")
        .optional(),
    slug: z.string()
        .min(1, "Slug là bắt buộc")
        .max(100, "Slug không được vượt quá 100 ký tự")
        .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
        .optional(),
    productId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Product ID không hợp lệ")
        .optional(),
    categoryId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Category ID không hợp lệ")
        .optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string()
        .url("URL hình ảnh không hợp lệ")
        .optional()
});

// Schema cho query params của getListBanner
export const getBannerQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, "Page phải là số")
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, "Limit phải là số")
        .optional(),
    isActive: z.enum(["true", "false"])
        .optional(),
    categoryId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Category ID không hợp lệ")
        .optional(),
    search: z.string()
        .max(100, "Từ khóa tìm kiếm không được vượt quá 100 ký tự")
        .optional()
});
