import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    logoUrl: {
        type: String,
        default: null,
    },
    description: {
        type: String,
    },
    slug: {
        type: String,    
        required: true,
    },
    seoTitle: {
        type: String,
    },
    seoDescription: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deletedAt: {
        type: Date,
        default: null
    },
},
{
    timestamps: true,
    versionKey: false
}); 

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;