import express from "express";
import router from "./src/routes/index.js";
import connectDB from "./src/configs/db.js";
import { HOST, PORT } from "./src/configs/enviroments.js";
import errorHandler from "./src/middlewares/errorHandle.js";
import cors from 'cors'

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());

connectDB()

app.use("/api", router)

app.use(errorHandler)

app.listen(PORT,HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
