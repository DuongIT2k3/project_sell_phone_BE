import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
        },
        shortDescription:{
            type: String,
        },
        images: {
            type: Array,
        },
        category: {
            type: String,
        },
        quantity:{
            type: String,
        },
        thumbnail: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export default mongoose.model("Product", productSchema)