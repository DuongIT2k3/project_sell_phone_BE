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
    deletedAt: {
        type: Date,
        default: null,
    },
},{
    versionKey: false,
    timestamps: true
})

bannerSchema.index({ slug: 1 }, { unique: true });
bannerSchema.index({ productId: 1 });
bannerSchema.index({ categoryId: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ deletedAt: 1 });
bannerSchema.index({ createdAt: -1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;