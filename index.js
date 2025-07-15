import express from "express";
import router from "./src/routes/index.js";
import connectDB from "./src/common/configs/db.js";
import {  HOST, PORT } from "./src/common/configs/environments.js";
import errorHandler from "./src/common/middlewares/errorHandle.js";
import cors from 'cors'
import setupSwagger from "./src/common/configs/swagger-config.js";
import { handlPayOsWebhook } from "./src/modules/order/order.controller.js";

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(express.json());

connectDB()

setupSwagger(app);

app.use("/api", router)
app.post("/webhook", handlPayOsWebhook)

app.use(errorHandler)

app.listen(PORT, HOST,() => {
  console.log(`Server is running on: http://${HOST}:${PORT}/api`);
	console.log(`Swagger Docs available at http://${HOST}:${PORT}/api-docs`);
});
