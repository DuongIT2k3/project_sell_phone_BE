import { z } from "zod";

const categorySchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	slug: z.string().min(1, "Slug is required"),
	deletedAt: z.date().nullable().optional(),
	categoryParentId: z.string(),
});

export default categorySchema;