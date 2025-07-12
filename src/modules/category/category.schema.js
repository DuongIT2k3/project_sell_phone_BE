import { z } from "zod";

const categorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});


const categoryUpdateSchema = categorySchema.partial();

export default categorySchema;
export { categoryUpdateSchema };