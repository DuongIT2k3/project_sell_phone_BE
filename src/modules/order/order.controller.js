import PayOS from "@payos/node";
import {
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  PAYOS_CLIENT_ID,
} from "../../common/configs/environments.js";
import createResponse from "../../common/utils/response.js";
import handleAsync from "../../common/utils/handleAsync.js";

const fakeData = {
  userId: "1",
  address: "Ha Noi",
  phoneNumber: "0123456789",
  note: "Please deliver quickly",
  status: "pending",
  products: [
    {
      name: "iphone 14 Pro Max",
      quantity: 1,
      price: 1000,
    },
    {
      name: "Samsung Galaxy S21",
      price: 800,
      quantity: 1,
    },
  ],
  totalPrice: 1800,
  isPaid: false,
};
const payOS = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
export const createOrder = handleAsync(async (req, res, next) => {
  const orderCode = Number(String(Date.now()).slice(-6));
  const bodyPayOS = {
    orderCode: orderCode,
    amount: fakeData.totalPrice,
    description: "Thanh toan don hang",
    items: fakeData.products,
    cancelUrl: "http://localhost:3000/cancel.html",
    returnUrl: "http://localhost:3000/success.html",
  };
  const createPaymentLink = await payOS.createPaymentLink(bodyPayOS);
  return res.status(200).json(createResponse(true, 200, "Create order successfully", createPaymentLink));
});
