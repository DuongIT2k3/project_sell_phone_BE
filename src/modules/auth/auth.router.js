import { Router } from "express";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authLogin, authRegister } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", validBodyRequest(registerSchema), authRegister);
authRouter.post("/login", validBodyRequest(loginSchema), authLogin);

export default authRouter;