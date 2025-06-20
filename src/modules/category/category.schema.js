import { z } from "zod";

const categorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    deletedAt: z.date().nullable().optional(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional()
})

export default categorySchema;