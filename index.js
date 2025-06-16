import express from "express";
import router from "./src/routes/index.js";
import connectDB from "./src/common/configs/db.js";
import {  PORT } from "./src/common/configs/environments.js";
import errorHandler from "./src/common/middlewares/errorHandle.js";
import cors from 'cors'
import setupSwagger from "./src/common/configs/swagger-config.js";

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());

connectDB()

setupSwagger(app);

app.use("/api", router)

app.use(errorHandler)

app.listen(PORT,() => {
  console.log(`Server running at http://${PORT}/`);
  console.log(`Swagger Docs available at ${PORT}/api-docs`);
});
