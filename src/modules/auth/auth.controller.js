import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, JWT_EXPIRES_IN, JWT_SECRET_KEY_FOR_EMAIL, JWT_EXPIRES_IN_FOR_EMAIL } from "../../common/configs/environments.js";
import sendEmail from "../../common/utils/mailSender.js";

export const authRegister = handleAsync(async (req,res,next) => {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(createError(400, MESSAGES.AUTH.EMAIL_ALREADY_EXISTS));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
        ...req.body,
        password: hash,
        role: "member",
    });
    if(!newUser) return next(createError(500, MESSAGES.AUTH.REGISTER_FAILED));
    
    const verifyEmailToken = jwt.sign(
        { id: newUser._id },
        JWT_SECRET_KEY_FOR_EMAIL,
        { expiresIn: JWT_EXPIRES_IN_FOR_EMAIL }
    )

    const verifyEmailLink = `http://localhost:8888/api/auth/verify-email/${verifyEmailToken}`;
    
    sendEmail(
        newUser.email, 
        "Verify your email",
        `Hello ${newUser.fullName || "User"},\n\n
        Please click the link below to verify your email address:\n
        ${verifyEmailLink}\n\n
        If you did not create an account, please ignore this email.
        
        \n\nThank you for registering with us!\n
        Best regards,\n
        `
    )

    newUser.password = undefined;
    return res.json(createResponse(true, 201, MESSAGES.AUTH.REGISTER_SUCCESS, newUser));

})
export const authLogin = handleAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (!existing) return next(createError(400, MESSAGES.AUTH.USER_NOT_EXISTS));
    const isMatch = bcrypt.compareSync(password, existing.password);
    if(!isMatch) return next(createError(400, MESSAGES.AUTH.LOGIN_FAILED));

    const accessToken = jwt.sign(
        { id: existing._id },
        JWT_SECRET_KEY,
        { expiresIn: JWT_EXPIRES_IN }
    )
    if(accessToken){
        existing.password = undefined;
        return res.json(createResponse(true, 200, MESSAGES.AUTH.LOGIN_SUCCESS, {
            user: existing,
            accessToken
        }));
    }
    return next(createError(500, MESSAGES.AUTH.LOGIN_FAILED));
});

export const authLogout = handleAsync(async (req, res, next) => {})

export const authRefreshToken = handleAsync(async(req, res,next) => {})

export const authVerifyEmail = handleAsync(async (req, res, next) => {})

export const authForgotPassword = handleAsync(async (req, res, next) => {})

export const authResetPassword = handleAsync(async (req, res, next) => {})