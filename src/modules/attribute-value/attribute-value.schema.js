import {z} from 'zod';

const AttributeValueSchema = z.object({
    value: z.string().min(1, "Attribute value is required"),
    attributeId: z.string().min(1, "Attribute ID is required"),
    deletedAt: z.date().optional().nullable().default(null)
})

export default AttributeValueSchema;