import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import  MESSAGES from "../../common/constants/messages.js";
import Cart from "./cart.model.js";
import CartProduct from "./cart-product.model.js";
import ProductVariant from "../product-variant/product-variant.model.js";
import Product from "../product/product.model.js";
import mongoose from "mongoose";

// Thêm sản phẩm vào giỏ hàng
export const addToCart = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { productId, variantId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
        return next(createError(400, MESSAGES.CART.MISSING_REQUIRED_FIELDS, "Thiếu thông tin sản phẩm"));
    }

    if (quantity <= 0) {
        return next(createError(400, MESSAGES.CART.QUANTITY_MUST_BE_POSITIVE, "Số lượng phải lớn hơn 0"));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createError(400, MESSAGES.CART.INVALID_PRODUCT_ID, "ID sản phẩm không hợp lệ"));
    }

    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(createError(400, MESSAGES.CART.INVALID_PRODUCT_ID, "ID biến thể không hợp lệ"));
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) {
        return next(createError(404, MESSAGES.CART.PRODUCT_NOT_FOUND, "Sản phẩm không tồn tại"));
    }

    let variant = null;
    let price = product.priceDefault;
    let availableStock = product.stockTotal;

    // Nếu có variantId, kiểm tra variant
    if (variantId) {
        variant = await ProductVariant.findOne({
            _id: variantId,
            productId: productId,
            deletedAt: null
        });

        if (!variant) {
            return next(createError(404, MESSAGES.CART.VARIANT_NOT_FOUND, "Biến thể sản phẩm không tồn tại"));
        }

        price = variant.price;
        availableStock = variant.stock;
    }

    if (availableStock < quantity) {
        return next(createError(400, MESSAGES.CART.INSUFFICIENT_STOCK, `Chỉ còn ${availableStock} sản phẩm trong kho`));
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        cart = await Cart.create({ userId: user._id, totalPrice: 0 });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const queryCondition = {
        cartId: cart._id,
        productId: productId
    };
    
    // Nếu có variantId thì thêm vào điều kiện query
    if (variantId) {
        queryCondition.variantId = variantId;
    } else {
        // Nếu không có variantId, chỉ tìm product không có variant
        queryCondition.variantId = { $exists: false };
    }
    
    const existingCartProduct = await CartProduct.findOne(queryCondition);

    if (existingCartProduct) {
        // Cập nhật số lượng
        const newQuantity = existingCartProduct.quantity + quantity;
        if (newQuantity > availableStock) {
            return next(createError(400, MESSAGES.CART.INSUFFICIENT_STOCK, `Chỉ còn ${availableStock} sản phẩm trong kho`));
        }

        existingCartProduct.quantity = newQuantity;
        existingCartProduct.totalPrice = newQuantity * price;
        await existingCartProduct.save();
    } else {
        // Thêm sản phẩm mới vào giỏ hàng
        const cartProductData = {
            cartId: cart._id,
            productId: productId,
            quantity: quantity,
            price: price,
            totalPrice: quantity * price
        };
        
        // Chỉ thêm variantId nếu có
        if (variantId) {
            cartProductData.variantId = variantId;
        }
        
        await CartProduct.create(cartProductData);
    }

    // Cập nhật tổng giá giỏ hàng
    const cartProducts = await CartProduct.find({ cartId: cart._id });
    const newTotalPrice = cartProducts.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalPrice = newTotalPrice;
    await cart.save();

    return res.json(createResponse(true, 200, "Đã thêm sản phẩm vào giỏ hàng", { cartId: cart._id }));
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCart = handleAsync(async (req, res, next) => {
    const user = req.user;
    const { productId, variantId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
        return next(createError(400, MESSAGES.CART.MISSING_REQUIRED_FIELDS, "Thiếu thông tin sản phẩm"));
    }

    if (quantity <= 0) {
        return next(createError(400, MESSAGES.CART.QUANTITY_MUST_BE_POSITIVE, "Số lượng phải lớn hơn 0"));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createError(400, MESSAGES.CART.INVALID_PRODUCT_ID, "ID sản phẩm không hợp lệ"));
    }

    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
        return next(createError(400, MESSAGES.CART.INVALID_PRODUCT_ID, "ID biến thể không hợp lệ"));
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({
        _id: productId,
        deletedAt: null
    });

    if (!product) {
        return next(createError(404, MESSAGES.CART.PRODUCT_NOT_FOUND, "Sản phẩm không tồn tại"));
    }

    let variant = null;
    let price = product.priceDefault;
    let stock = product.stock || 0;

    // Nếu có variantId, kiểm tra variant
    if (variantId) {
        variant = await ProductVariant.findOne({
            _id: variantId,
            productId: productId,
            deletedAt: null
        });

        if (!variant) {
            return next(createError(404, MESSAGES.CART.VARIANT_NOT_FOUND, "Biến thể sản phẩm không tồn tại"));
        }

        price = variant.price;
        stock = variant.stock;
    }

    if (stock < quantity) {
        return next(createError(400, MESSAGES.CART.INSUFFICIENT_STOCK, `Chỉ còn ${stock} sản phẩm trong kho`));
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        cart = await Cart.create({ userId: user._id, totalPrice: 0 });
    }

    // Tìm sản phẩm trong giỏ hàng
    const cartProductQuery = {
        cartId: cart._id,
        productId: productId,
        deletedAt: null
    };

    // Thêm variantId vào query nếu có
    if (variantId) {
        cartProductQuery.variantId = variantId;
    } else {
        cartProductQuery.variantId = null;
    }

    const existingCartProduct = await CartProduct.findOne(cartProductQuery);

    if (existingCartProduct) {
        // Cập nhật số lượng (thay thế quantity thay vì cộng thêm)
        if (stock < quantity) {
            return next(createError(400, MESSAGES.CART.QUANTITY_EXCEEDS_STOCK, `Số lượng vượt quá hàng tồn kho (${stock})`));
        }

        existingCartProduct.quantity = quantity;
        existingCartProduct.price = price;
        existingCartProduct.totalPrice = quantity * price;
        await existingCartProduct.save();
    } else {
        // Tạo sản phẩm mới trong giỏ hàng (chỉ khi chưa tồn tại)
        const cartProductData = {
            cartId: cart._id,
            productId: productId,
            quantity: quantity,
            price: price,
            totalPrice: quantity * price
        };
        
        // Chỉ thêm variantId nếu có
        if (variantId) {
            cartProductData.variantId = variantId;
        }
        
        await CartProduct.create(cartProductData);
    }

    // Cập nhật tổng giá tiền trong giỏ hàng
    await updateCartTotalPrice(cart._id);

    return res.json(createResponse(true, 200, MESSAGES.CART.UPDATE_SUCCESS, null));
});

// Lấy thông tin giỏ hàng
export const getCart = handleAsync(async (req, res, next) => {
    const user = req.user;

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: user._id });
    
    if (!cart) {
        return res.json(createResponse(true, 200, MESSAGES.CART.GET_SUCCESS, {
            cart: { userId: user._id, totalPrice: 0 },
            items: []
        }));
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
            $lookup: {
                from: "brands",
                localField: "product.brand",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                quantity: 1,
                price: 1,
                totalPrice: 1,
                createdAt: 1,
                updatedAt: 1,
                product: {
                    _id: "$product._id",
                    title: "$product.title",
                    slug: "$product.slug",
                    thumbnail: "$product.thumbnail",
                    images: "$product.images",
                    priceDefault: "$product.priceDefault",
                    brand: {
                        _id: "$brand._id",
                        title: "$brand.title"
                    }
                },
                variant: {
                    $cond: {
                        if: { $ne: ["$variant", null] },
                        then: {
                            _id: "$variant._id",
                            color: "$variant.color",
                            capacity: "$variant.capacity",
                            price: "$variant.price",
                            oldPrice: "$variant.oldPrice",
                            stock: "$variant.stock"
                        },
                        else: null
                    }
                }
            }
        }
    ]);

    return res.json(createResponse(true, 200, MESSAGES.CART.GET_SUCCESS, {
        cart,
        items: cartItems
    }));
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