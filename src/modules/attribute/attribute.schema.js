import {z} from 'zod';

const AttributeSchema = z.object({
    attributeName: z.string().min(1, "Attribute name is required"),
    attributeCode: z.string().min(1, "Attribute code is required"),
    description: z.string().optional().default(""),
    deletedAt: z.date().optional().nullable().default(null)
})

export default AttributeSchema;