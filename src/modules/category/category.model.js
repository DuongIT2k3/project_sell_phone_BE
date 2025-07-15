import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
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
            default: ""
        },
        seoDescription: {
            type: String,
            default: ""
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ deletedAt: 1 });
categorySchema.index({ createdAt: -1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;