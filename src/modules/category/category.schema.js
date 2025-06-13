import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    deletedAt: z.date().nullable().optional(),
})

export default categorySchema;