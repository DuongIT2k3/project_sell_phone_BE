import { z } from "zod";

const SubCategorySchema = z.object({
  parentCategoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Parent Category ID")
    .min(1, "Parent category ID is required"),
  title: z.string().min(1, "Title is required"),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});


const SubCategoryUpdateSchema = SubCategorySchema.partial();

export default SubCategorySchema;
export { SubCategoryUpdateSchema };