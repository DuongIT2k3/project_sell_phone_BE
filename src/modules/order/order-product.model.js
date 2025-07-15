import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
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
orderProductSchema.index({ orderId: 1 });
orderProductSchema.index({ productId: 1 });
orderProductSchema.index({ productVariantId: 1 });
orderProductSchema.index({ deletedAt: 1 });
orderProductSchema.index({ createdAt: -1 });
const OrderProduct = mongoose.model("OrderProduct", orderProductSchema);
export default OrderProduct;