import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    attributeValues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttributeValue",
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
    },
    soldCount: {
      type: Number,
    },
    specifications: {
      type: Object,
    },
    stock: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;