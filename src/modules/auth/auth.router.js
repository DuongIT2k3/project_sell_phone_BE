import { Router } from "express";
import validBodyRequest from "../../common/middlewares/validBodyRequest.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./auth.schema.js";
import { authForgotPassword, authLogin, authLogout, authRefreshToken, authRegister, authResetPassword, authVerifyEmail } from "./auth.controller.js";
import restrict from "../../common/middlewares/restrict.js";

const authRouter = Router();

authRouter.post("/register", validBodyRequest(registerSchema), authRegister);
authRouter.post("/login", validBodyRequest(loginSchema), authLogin);
authRouter.post("/logout", restrict(["member", "admin", "superAdmin"]), authLogout);
authRouter.post("/refresh-token", authRefreshToken);
authRouter.get("/verify-email/:token", authVerifyEmail);
authRouter.post("/forgot-password", validBodyRequest(forgotPasswordSchema), authForgotPassword);
authRouter.post("/reset-password/:token",validBodyRequest(resetPasswordSchema), authResetPassword);

export default authRouter;