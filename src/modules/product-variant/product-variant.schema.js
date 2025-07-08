import { z } from "zod";

const ProductVariantSchema = z.object({
  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID")
    .min(1, "Product ID is required"),
  price: z.number().min(0, "Price must be non-negative"),
  oldPrice: z.number().min(0, "Old price must be non-negative").optional().default(0),
  stock: z.number().min(0, "Stock must be non-negative").optional().default(0),
  soldCount: z.number().min(0, "Sold count must be non-negative").optional().default(0),
  sku: z.string().min(1, "SKU is required"),
  imageUrls: z.array(z.string()).optional().default([]),
});

export default ProductVariantSchema;