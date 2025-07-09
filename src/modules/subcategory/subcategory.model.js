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
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

const SubCategory = mongoose.model("SubCategory", subCategorySchema)
export default SubCategory;