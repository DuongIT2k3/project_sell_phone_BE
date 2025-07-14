import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import  MESSAGES from "../../common/constants/messages.js";
import Cart from "./cart.model.js";
import CartProduct from "./cart-product.model.js";
import ProductVariant from "../product-variant/product-variant.model.js";
import mongoose from "mongoose";

// Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng
export const updateCart = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { productId, variantId, quantity } = req.body;

    // Validate input
    if (!productId || !variantId || !quantity) {
        return next(createError(400, MESSAGES.CART.MISSING_REQUIRED_FIELDS, "Thiếu thông tin sản phẩm"));
    }

    if (quantity <= 0) {
        return next(createError(400, MESSAGES.CART.QUANTITY_MUST_BE_POSITIVE, "Số lượng phải lớn hơn 0"));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(createError(400, MESSAGES.CART.INVALID_PRODUCT_ID, "ID sản phẩm không hợp lệ"));
    }

    // Kiểm tra variant tồn tại và còn hàng
    const variant = await ProductVariant.findOne({
        _id: variantId,
        productId: productId,
        deletedAt: null
    });

    if (!variant) {
        return next(createError(404, MESSAGES.CART.VARIANT_NOT_FOUND, "Biến thể sản phẩm không tồn tại"));
    }

    if (variant.stock < quantity) {
        return next(createError(400, MESSAGES.CART.INSUFFICIENT_STOCK, `Chỉ còn ${variant.stock} sản phẩm trong kho`));
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        cart = await Cart.create({ userId: user._id, totalPrice: 0 });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingCartProduct = await CartProduct.findOne({
        cartId: cart._id,
        productId: productId,
        variantId: variantId,
        deletedAt: null
    });

    if (existingCartProduct) {
        // Cập nhật số lượng nếu đã có
        const newQuantity = existingCartProduct.quantity + quantity;
        
        if (variant.stock < newQuantity) {
            return next(createError(400, MESSAGES.CART.QUANTITY_EXCEEDS_STOCK, `Tổng số lượng vượt quá hàng tồn kho (${variant.stock})`));
        }

        existingCartProduct.quantity = newQuantity;
        await existingCartProduct.save();
    } else {
        // Thêm sản phẩm mới vào giỏ hàng
        await CartProduct.create({
            cartId: cart._id,
            productId: productId,
            variantId: variantId,
            quantity: quantity,
            price: variant.price
        });
    }

    // Cập nhật tổng giá tiền trong giỏ hàng
    await updateCartTotalPrice(cart._id);

    return createResponse(res, 200, MESSAGES.CART.ADD_ITEM_SUCCESS, null);
});

// Lấy thông tin giỏ hàng
export const getCart = handleAsync(async (req, res, next) => {
    const user = req.user;

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: user._id });
    
    if (!cart) {
        return createResponse(res, 200, MESSAGES.CART.GET_SUCCESS, {
            cart: { userId: user._id, totalPrice: 0 },
            items: []
        });
    }

    // Lấy danh sách sản phẩm trong giỏ hàng với thông tin chi tiết
    const cartItems = await CartProduct.aggregate([
        {
            $match: {
                cartId: cart._id,
                deletedAt: null
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $lookup: {
                from: "productvariants",
                localField: "variantId",
                foreignField: "_id",
                as: "variant"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $unwind: "$variant"
        },
        {
            $lookup: {
                from: "brands",
                localField: "product.brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $project: {
                _id: 1,
                quantity: 1,
                price: 1,
                createdAt: 1,
                updatedAt: 1,
                product: {
                    _id: "$product._id",
                    name: "$product.name",
                    slug: "$product.slug",
                    images: "$product.images",
                    brand: { $arrayElemAt: ["$brand.name", 0] }
                },
                variant: {
                    _id: "$variant._id",
                    color: "$variant.color",
                    capacity: "$variant.capacity",
                    price: "$variant.price",
                    oldPrice: "$variant.oldPrice",
                    stock: "$variant.stock"
                },
                totalPrice: { $multiply: ["$quantity", "$price"] }
            }
        }
    ]);

    return createResponse(res, 200, MESSAGES.CART.GET_SUCCESS, {
        cart,
        items: cartItems
    });
});

// Xóa sản phẩm khỏi giỏ hàng hoặc giảm số lượng
export const deleteCart = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { cartProductId, removeAll = false } = req.body;

    if (!cartProductId) {
        return next(createError(400, MESSAGES.CART.INVALID_CART_PRODUCT_ID, "Thiếu ID sản phẩm trong giỏ hàng"));
    }

    if (!mongoose.Types.ObjectId.isValid(cartProductId)) {
        return next(createError(400, MESSAGES.CART.INVALID_CART_PRODUCT_ID, "ID sản phẩm không hợp lệ"));
    }

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        return next(createError(404, MESSAGES.CART.NOT_FOUND, "Giỏ hàng không tồn tại"));
    }

    // Tìm sản phẩm trong giỏ hàng
    const cartProduct = await CartProduct.findOne({
        _id: cartProductId,
        cartId: cart._id,
        deletedAt: null
    });

    if (!cartProduct) {
        return next(createError(404, MESSAGES.CART.PRODUCT_NOT_IN_CART, "Sản phẩm không có trong giỏ hàng"));
    }

    if (removeAll || cartProduct.quantity <= 1) {
        // Xóa hoàn toàn sản phẩm khỏi giỏ hàng (soft delete)
        cartProduct.deletedAt = new Date();
        await cartProduct.save();
    } else {
        // Giảm số lượng đi 1
        cartProduct.quantity -= 1;
        await cartProduct.save();
    }

    // Cập nhật tổng giá tiền trong giỏ hàng
    await updateCartTotalPrice(cart._id);

    return createResponse(res, 200, MESSAGES.CART.REMOVE_ITEM_SUCCESS, null);
});

// Xóa toàn bộ giỏ hàng
export const clearCart = handleAsync(async (req, res, next) => {
    const user = req.user;

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        return next(createError(404, MESSAGES.CART.NOT_FOUND, "Giỏ hàng không tồn tại"));
    }

    // Soft delete tất cả sản phẩm trong giỏ hàng
    await CartProduct.updateMany(
        { cartId: cart._id, deletedAt: null },
        { deletedAt: new Date() }
    );

    // Cập nhật tổng giá tiền về 0
    cart.totalPrice = 0;
    await cart.save();

    return createResponse(res, 200, MESSAGES.CART.CLEAR_CART_SUCCESS, null);
});

const updateCartTotalPrice = async (cartId) => {
    const result = await CartProduct.aggregate([
        {
            $match: {
                cartId: cartId,
                deletedAt: null
            }
        },
        {
            $group: {
                _id: null,
                totalPrice: {
                    $sum: { $multiply: ["$quantity", "$price"] }
                }
            }
        }
    ]);

    const totalPrice = result.length > 0 ? result[0].totalPrice : 0;
    
    await Cart.findByIdAndUpdate(cartId, { totalPrice });
};