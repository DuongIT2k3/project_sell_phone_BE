import Cart from "./cart.model.js";

export const createCartForUser = async (userId) => {
  const cart = await Cart.create({
    userId,
    item: [],
  });
  return cart;
};
