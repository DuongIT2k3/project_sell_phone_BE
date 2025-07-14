import mongoose from "mongoose";
import {DB_URI, NGROK_AUTH_TOKEN, PORT} from './environments.js'
import { confirmWebhook } from "../../modules/order/order.controller.js";


function connectDB(){
    mongoose.connect(DB_URI)
    .then(() => {
      console.log("Kết nối thành công");
    })
    .then(async() => {
      const ngrok = await import("@ngrok/ngrok")
      const listener = await ngrok.forward({
        addr: PORT,
        authtoken: NGROK_AUTH_TOKEN,
      });
      const urlNgrokWebhook = `${listener.url()}/webhook`;
      confirmWebhook(urlNgrokWebhook);
    })
    .catch((error) => {
      console.error("Lỗi kết nối ", error)
    })
}
export default connectDB;