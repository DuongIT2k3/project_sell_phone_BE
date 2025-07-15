import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true, // e.g., "Red", "Black"
    },
    capacity: {
      type: String,
      required: true, // e.g., "128GB", "256GB"
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ color: 1 });
productVariantSchema.index({ capacity: 1 });
productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index({ deletedAt: 1 });
productVariantSchema.index({ createdAt: -1 });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;