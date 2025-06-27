import {z} from 'zod';

const AttributeSchema = z.object({
    attributeName: z.string().min(1, "Attribute name is required"),
    attributeCode: z.string().min(1, "Attribute code is required"),
    description: z.string().optional().default(""),
    type: z.enum(['string', 'number', 'enum'], {
        required_error: "Attribute type is required",
    }),
    enumValues: z.array(z.string().min(1, "Enum value is required")).optional().default([]),
    isActive: z.boolean().optional().default(true),
    deletedAt: z.date().optional().nullable().default(null)
})

export default AttributeSchema;