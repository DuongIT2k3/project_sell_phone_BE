import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cartSchema.index({ userId: 1 });
cartSchema.index({ deletedAt: 1 });
cartSchema.index({ createdAt: -1 });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;