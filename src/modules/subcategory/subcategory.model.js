import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
    {
        title: {
            type: String,
            unique: true,
            required: true,
        },
        description: {
            type: String,
        },
        slug: {
            type: String,
            unique: true,
            required: true,
        },
        deletedAt: {
            type: Date,
            default: null
        },
        categoryParentId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        logoUrl: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        seoTitle: {
            type: String,
            default: null
        },
        seoDescription: {
            type: String,
            default: null
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

const SubCategory = mongoose.model("SubCategory", subCategorySchema)
export default SubCategory;