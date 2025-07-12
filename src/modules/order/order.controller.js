import PayOS from "@payos/node";
import {
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_CLIENT_ID,
} from "../../common/configs/environments.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import handleAsync from "../../common/utils/handleAsync.js";
import  MESSAGES  from "../../common/constants/messages.js";
import Order from "./order.model.js";
import OrderProduct from "./order-product.model.js";
import Cart from "../cart/cart.model.js";
import CartProduct from "../cart/cart-product.model.js";
import ProductVariant from "../product-variant/product-variant.model.js";
import User from "../user/user.model.js";
import mongoose from "mongoose";

const payOS = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);

// Tạo đơn hàng từ giỏ hàng
export const createOrder = handleAsync(async (req, res, next) => {
  const user = req.user;
  const { 
    phoneNumber, 
    addressId, 
    note = "", 
    paymentMethod = "PAYOS",
    shippingFee = 0,
    discountAmount = 0
  } = req.body;

  // Validate input
  if (!phoneNumber || !addressId) {
    return next(createError(400, MESSAGES.ORDER.MISSING_FIELDS));
  }

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    return next(createError(400, MESSAGES.ORDER.INVALID_ADDRESS_ID));
  }

  // Lấy giỏ hàng của user
  const cart = await Cart.findOne({ userId: user._id });
  if (!cart) {
    return next(createError(404, MESSAGES.ORDER.CART_NOT_FOUND));
  }

  // Lấy các sản phẩm trong giỏ hàng
  const cartItems = await CartProduct.find({
    cartId: cart._id,
    deletedAt: null
  }).populate('productId').populate('variantId');

  if (!cartItems || cartItems.length === 0) {
    return next(createError(400, MESSAGES.ORDER.CART_EMPTY));
  }

  // Kiểm tra tồn kho và tính tổng tiền
  let totalPrice = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const variant = await ProductVariant.findById(item.variantId);
    
    if (!variant || variant.deletedAt) {
      return next(createError(404, MESSAGES.ORDER.PRODUCT_NOT_FOUND, 
        `Sản phẩm ${item.productId.name} không còn tồn tại`));
    }

    if (variant.stock < item.quantity) {
      return next(createError(400, MESSAGES.ORDER.INSUFFICIENT_STOCK,
        `Sản phẩm ${item.productId.name} chỉ còn ${variant.stock} trong kho`));
    }

    const itemTotal = item.quantity * variant.price;
    totalPrice += itemTotal;

    orderItems.push({
      productId: item.productId._id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      unitPrice: variant.price,
      total: itemTotal,
      // Thông tin cho PayOS
      name: `${item.productId.name} - ${variant.color} ${variant.capacity}`,
      price: variant.price
    });
  }

  // Tính tổng cuối cùng
  const finalTotal = totalPrice + shippingFee - discountAmount;

  // Tạo order code unique
  const orderCode = Number(String(Date.now()).slice(-6));

  // Tạo đơn hàng trong database
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tạo order
    const order = await Order.create([{
      userId: user._id,
      phoneNumber,
      addressId,
      note,
      paymentMethod,
      paymentStatus: "PENDING",
      paid: false,
      totalPrice: finalTotal,
      status: "Pending",
      discountAmount,
      shippingFee,
      orderCode
    }], { session });

    // Tạo order products
    const orderProductsData = orderItems.map(item => ({
      orderId: order[0]._id,
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    await OrderProduct.create(orderProductsData, { session });

    // Trừ số lượng tồn kho
    for (const item of orderItems) {
      await ProductVariant.findByIdAndUpdate(
        item.productVariantId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Xóa giỏ hàng
    await CartProduct.updateMany(
      { cartId: cart._id, deletedAt: null },
      { deletedAt: new Date() },
      { session }
    );

    // Cập nhật tổng giá giỏ hàng về 0
    await Cart.findByIdAndUpdate(cart._id, { totalPrice: 0 }, { session });

    // Tạo payment link với PayOS
    const bodyPayOS = {
      orderCode: orderCode,
      amount: finalTotal,
      description: `Thanh toán đơn hàng #${orderCode}`,
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      cancelUrl: `${process.env.FRONTEND_URL}/order/cancel?orderCode=${orderCode}`,
      returnUrl: `${process.env.FRONTEND_URL}/order/success?orderCode=${orderCode}`,
    };

    const paymentLink = await payOS.createPaymentLink(bodyPayOS);

    // Lưu payment info vào order
    await Order.findByIdAndUpdate(
      order[0]._id,
      { 
        paymentUrl: paymentLink.checkoutUrl,
        payOSOrderCode: orderCode
      },
      { session }
    );

    await session.commitTransaction();

    return createResponse(res, 201, MESSAGES.ORDER.CREATE_SUCCESS, {
      order: order[0],
      paymentLink: paymentLink.checkoutUrl,
      orderCode
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error);
    return next(createError(500, MESSAGES.ORDER.CREATE_ERROR, error.message));
  } finally {
    session.endSession();
  }
});

// Webhook từ PayOS để xử lý kết quả thanh toán
export const paymentWebhook = handleAsync(async (req, res, next) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.orderCode) {
      return next(createError(400, MESSAGES.ORDER.INVALID_WEBHOOK_DATA));
    }

    const order = await Order.findOne({ payOSOrderCode: data.orderCode });
    if (!order) {
      return next(createError(404, MESSAGES.ORDER.NOT_FOUND));
    }

    // Cập nhật trạng thái thanh toán
    if (data.code === "00") {
      // Thanh toán thành công
      order.paymentStatus = "PAID";
      order.paid = true;
      order.status = "Processing";
    } else {
      // Thanh toán thất bại
      order.paymentStatus = "FAILED";
      order.status = "Cancelled";
      
      // Hoàn lại tồn kho
      const orderProducts = await OrderProduct.find({ orderId: order._id });
      for (const item of orderProducts) {
        await ProductVariant.findByIdAndUpdate(
          item.productVariantId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    return createResponse(res, 200, MESSAGES.ORDER.WEBHOOK_SUCCESS, null);
  } catch (error) {
    console.error("Webhook error:", error);
    return next(createError(500, MESSAGES.ORDER.WEBHOOK_ERROR, error.message));
  }
});

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = handleAsync(async (req, res, next) => {
  const { orderCode } = req.params;
  const user = req.user;

  if (!orderCode) {
    return next(createError(400, MESSAGES.ORDER.MISSING_ORDER_CODE));
  }

  const order = await Order.findOne({ 
    payOSOrderCode: orderCode,
    userId: user._id 
  });

  if (!order) {
    return next(createError(404, MESSAGES.ORDER.NOT_FOUND));
  }

  try {
    // Kiểm tra trạng thái từ PayOS
    const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
    
    // Cập nhật trạng thái nếu cần
    if (paymentInfo.status === "PAID" && !order.paid) {
      order.paymentStatus = "PAID";
      order.paid = true;
      order.status = "Processing";
      await order.save();
    }

    return createResponse(res, 200, MESSAGES.ORDER.GET_SUCCESS, {
      order,
      paymentInfo
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return createResponse(res, 200, MESSAGES.ORDER.GET_SUCCESS, { order });
  }
});

// Lấy danh sách đơn hàng của user
export const getUserOrders = handleAsync(async (req, res, next) => {
  const user = req.user;
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;
  const query = { userId: user._id };

  if (status) {
    query.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "orderproducts",
          localField: "_id",
          foreignField: "orderId",
          as: "products"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "products.productVariantId",
          foreignField: "_id",
          as: "variantDetails"
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]),
    Order.countDocuments(query)
  ]);

  const meta = {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };

  return createResponse(res, 200, MESSAGES.ORDER.GET_SUCCESS, { orders, meta });
});

// Lấy chi tiết đơn hàng
export const getOrderById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ORDER.INVALID_ID));
  }

  const order = await Order.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        userId: user._id
      }
    },
    {
      $lookup: {
        from: "orderproducts",
        localField: "_id",
        foreignField: "orderId",
        as: "products"
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "products.productVariantId",
        foreignField: "_id",
        as: "variantDetails"
      }
    },
    {
      $lookup: {
        from: "useraddresses",
        localField: "addressId",
        foreignField: "_id",
        as: "address"
      }
    }
  ]);

  if (!order || order.length === 0) {
    return next(createError(404, MESSAGES.ORDER.NOT_FOUND));
  }

  return createResponse(res, 200, MESSAGES.ORDER.GET_BY_ID_SUCCESS, order[0]);
});

// Hủy đơn hàng (chỉ khi chưa thanh toán)
export const cancelOrder = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, MESSAGES.ORDER.INVALID_ID));
  }

  const order = await Order.findOne({ _id: id, userId: user._id });
  if (!order) {
    return next(createError(404, MESSAGES.ORDER.NOT_FOUND));
  }

  if (order.paid || order.status !== "Pending") {
    return next(createError(400, MESSAGES.ORDER.CANNOT_CANCEL));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Cập nhật trạng thái đơn hàng
    order.status = "Cancelled";
    order.paymentStatus = "CANCELLED";
    await order.save({ session });

    // Hoàn lại tồn kho
    const orderProducts = await OrderProduct.find({ orderId: order._id });
    for (const item of orderProducts) {
      await ProductVariant.findByIdAndUpdate(
        item.productVariantId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Hủy payment link trên PayOS nếu có
    if (order.payOSOrderCode) {
      try {
        await payOS.cancelPaymentLink(order.payOSOrderCode);
      } catch (error) {
        console.log("Error canceling PayOS payment:", error.message);
      }
    }

    await session.commitTransaction();

    return createResponse(res, 200, MESSAGES.ORDER.CANCEL_SUCCESS, order);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error canceling order:", error);
    return next(createError(500, MESSAGES.ORDER.CANCEL_ERROR, error.message));
  } finally {
    session.endSession();
  }
});
