import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    order: {
        type: Number,
        default: 0,
    },
    slug: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
},{
    versionKey: false,
    timestamps: true
})

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;