import { z } from "zod";

const ProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).default([]),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  specifications: z.record(z.any()).optional(), // JSON object
  priceDefault: z.number().min(0, "Price must be non-negative"),
  soldCount: z.number().min(0, "Sold count must be non-negative").default(0),
  brand: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Brand ID")
    .optional(),
  subCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid SubCategory ID")
    .optional(),
  slug: z.string().min(1, "Slug is required"),
  averageRating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().min(0).default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  stockTotal: z.number().min(0, "Stock must be non-negative").default(0),
  deletedAt: z.date().optional().nullable().default(null),
  deletedBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
    .optional()
    .nullable(),
  updatedBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
    .optional()
    .nullable(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(["priceDefault", "averageRating", "soldCount", "createdAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export default ProductSchema;
