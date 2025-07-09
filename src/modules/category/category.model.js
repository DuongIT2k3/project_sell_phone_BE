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

const Category = mongoose.model("Category", categorySchema);
export default Category;