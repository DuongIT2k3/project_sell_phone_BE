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

subCategorySchema.index({ slug: 1 }, { unique: true });
subCategorySchema.index({ categoryParentId: 1 });
subCategorySchema.index({ isActive: 1 });
subCategorySchema.index({ deletedAt: 1 });
subCategorySchema.index({ createdAt: -1 });

const SubCategory = mongoose.model("SubCategory", subCategorySchema)
export default SubCategory;