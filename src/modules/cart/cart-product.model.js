import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
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

cartProductSchema.index({ cartId: 1 });
cartProductSchema.index({ productId: 1 });
cartProductSchema.index({ variantId: 1 });
cartProductSchema.index({ deletedAt: 1 });
cartProductSchema.index({ createdAt: -1 });

const CartProduct = mongoose.model("CartProduct", cartProductSchema);

export default CartProduct;