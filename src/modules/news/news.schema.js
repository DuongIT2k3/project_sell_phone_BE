import { z } from "zod";

// Schema cho việc tạo tin tức mới
export const createNewsSchema = z.object({
    title: z.string()
        .min(1, "Tiêu đề là bắt buộc")
        .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
    content: z.string()
        .min(1, "Nội dung là bắt buộc"),
    seoTitle: z.string()
        .max(60, "SEO Title không được vượt quá 60 ký tự")
        .optional(),
    seoDescription: z.string()
        .max(160, "SEO Description không được vượt quá 160 ký tự")
        .optional(),
    thumbnail: z.string()
        .min(1, "Thumbnail là bắt buộc")
        .url("Thumbnail phải là URL hợp lệ"),
    tags: z.array(z.string().trim())
        .optional()
        .default([]),
    slug: z.string()
        .min(1, "Slug là bắt buộc")
        .max(100, "Slug không được vượt quá 100 ký tự")
        .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
    isPublished: z.boolean()
        .optional()
        .default(false)
});

// Schema cho việc cập nhật tin tức
export const updateNewsSchema = z.object({
    title: z.string()
        .min(1, "Tiêu đề là bắt buộc")
        .max(200, "Tiêu đề không được vượt quá 200 ký tự")
        .optional(),
    content: z.string()
        .min(1, "Nội dung là bắt buộc")
        .optional(),
    seoTitle: z.string()
        .max(60, "SEO Title không được vượt quá 60 ký tự")
        .optional(),
    seoDescription: z.string()
        .max(160, "SEO Description không được vượt quá 160 ký tự")
        .optional(),
    thumbnail: z.string()
        .url("Thumbnail phải là URL hợp lệ")
        .optional(),
    tags: z.array(z.string().trim())
        .optional(),
    slug: z.string()
        .min(1, "Slug là bắt buộc")
        .max(100, "Slug không được vượt quá 100 ký tự")
        .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
        .optional(),
    isPublished: z.boolean()
        .optional()
});

// Schema cho query params
export const getNewsQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, "Page phải là số")
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, "Limit phải là số")
        .optional(),
    search: z.string()
        .max(100, "Từ khóa tìm kiếm không được vượt quá 100 ký tự")
        .optional(),
    tags: z.string()
        .optional(),
    author: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Author ID không hợp lệ")
        .optional(),
    isPublished: z.enum(["true", "false"])
        .optional()
});
