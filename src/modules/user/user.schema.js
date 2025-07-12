import { z } from "zod";

// Schema cho việc cập nhật profile user
export const updateProfileSchema = z.object({
    fullName: z.string()
        .min(1, "Họ tên là bắt buộc")
        .max(100, "Họ tên không được vượt quá 100 ký tự")
        .optional(),
    phoneNumber: z.string()
        .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .optional(),
    address: z.string()
        .max(200, "Địa chỉ không được vượt quá 200 ký tự")
        .optional(),
    bios: z.string()
        .max(500, "Tiểu sử không được vượt quá 500 ký tự")
        .optional(),
    avatar: z.string()
        .url("Avatar phải là URL hợp lệ")
        .optional()
});

// Schema cho việc cập nhật user (Admin)
export const updateUserSchema = z.object({
    fullName: z.string()
        .min(1, "Họ tên là bắt buộc")
        .max(100, "Họ tên không được vượt quá 100 ký tự")
        .optional(),
    phoneNumber: z.string()
        .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .optional(),
    address: z.string()
        .max(200, "Địa chỉ không được vượt quá 200 ký tự")
        .optional(),
    bios: z.string()
        .max(500, "Tiểu sử không được vượt quá 500 ký tự")
        .optional(),
    avatar: z.string()
        .url("Avatar phải là URL hợp lệ")
        .optional(),
    role: z.enum(["member", "admin", "superAdmin"])
        .optional(),
    isActive: z.boolean()
        .optional()
});

// Schema cho query params
export const getUsersQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, "Page phải là số")
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, "Limit phải là số")
        .optional(),
    search: z.string()
        .max(100, "Từ khóa tìm kiếm không được vượt quá 100 ký tự")
        .optional(),
    role: z.enum(["member", "admin", "superAdmin"])
        .optional(),
    isActive: z.enum(["true", "false"])
        .optional()
});
