import handleAsync from "../../common/utils/handleAsync.js";
import createResponse from "../../common/utils/response.js";
import createError from "../../common/utils/error.js";
import MESSAGES from "../../common/constants/messages.js";
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, JWT_EXPIRES_IN, JWT_SECRET_KEY_FOR_EMAIL, JWT_EXPIRES_IN_FOR_EMAIL, JWT_REFRESH_SECRET_KEY, JWT_REFRESH_EXPIRES_IN } from "../../common/configs/environments.js";
import sendEmail from "../../common/utils/mailSender.js";
import { createCartForUser } from "../cart/cart.service.js";

export const authRegister = handleAsync(async (req, res, next) => {
    const { email, password, fullName } = req.body;
    
    // Input validation
    if (!email || !password || !fullName) {
        return next(createError(400, MESSAGES.AUTH.MISSING_FIELDS || "Thiếu thông tin bắt buộc"));
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(createError(400, MESSAGES.AUTH.INVALID_EMAIL));
    }
    
    // Password strength validation
    if (password.length < 6) {
        return next(createError(400, MESSAGES.AUTH.INVALID_PASSWORD));
    }
    
    const existing = await User.findOne({ email, deletedAt: null });
    if (existing) return next(createError(400, MESSAGES.AUTH.EMAIL_ALREADY_EXISTS));
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
        ...req.body,
        password: hash,
        role: "member",
        isVerifyEmail: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    if (!newUser) return next(createError(500, MESSAGES.AUTH.REGISTER_FAILED));

    const cart = await createCartForUser(newUser._id);
    if (!cart) return next(createError(500, MESSAGES.CART.CREATE_FAILED));
    
    const verifyEmailToken = jwt.sign(
        { id: newUser._id },
        JWT_SECRET_KEY_FOR_EMAIL,
        { expiresIn: JWT_EXPIRES_IN_FOR_EMAIL }
    );

    const verifyEmailLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verifyEmailToken}`;
    
    try {
        await sendEmail(
            newUser.email,
            "Verify your email",
            `Hello ${newUser.fullName || "User"},\n\n
            Please click the link below to verify your email address:\n
            ${verifyEmailLink}\n\n
            If you did not create an account, please ignore this email.\n\n
            Thank you for registering with us!\n
            Best regards,`
        );
    } catch (error) {
        return next(createError(500, MESSAGES.AUTH.EMAIL_SEND_FAILED));
    }

    newUser.password = undefined;
    return res.json(createResponse(true, 201, MESSAGES.AUTH.REGISTER_SUCCESS, newUser));
});
export const authLogin = handleAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
        return next(createError(400, MESSAGES.AUTH.MISSING_FIELDS || "Thiếu email hoặc password"));
    }
    
    const existing = await User.findOne({ email, deletedAt: null });
    if (!existing) return next(createError(400, MESSAGES.AUTH.USER_NOT_EXISTS));
    
    const isMatch = bcrypt.compareSync(password, existing.password);
    if (!isMatch) return next(createError(400, MESSAGES.AUTH.LOGIN_FAILED));

    const isVerifyEmail = existing.isVerifyEmail || false;
    if (!isVerifyEmail) {
        return next(createError(400, MESSAGES.AUTH.EMAIL_NOT_VERIFIED));
    }

    const accessToken = jwt.sign(
        { id: existing._id, role: existing.role },
        JWT_SECRET_KEY,
        { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
        { id: existing._id },
        JWT_REFRESH_SECRET_KEY,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    
    await User.findByIdAndUpdate(existing._id, {
        refreshToken,
        latestLogin: new Date()
    });
    
    if (accessToken) {
        existing.password = undefined;
        return res.json(createResponse(true, 200, MESSAGES.AUTH.LOGIN_SUCCESS, {
            user: existing,
            accessToken,
            refreshToken
        }));
    }
    return next(createError(500, MESSAGES.AUTH.LOGIN_FAILED));
});

export const authLogout = handleAsync(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return next(createError(401, MESSAGES.AUTH.NOT_AUTHENTICATED));
    }

    await User.findByIdAndUpdate(user._id, { 
        refreshToken: null,
        updatedAt: new Date()
    });
    return res.json(createResponse(true, 200, MESSAGES.AUTH.LOGOUT_SUCCESS));
});

export const authRefreshToken = handleAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return next(createError(400, MESSAGES.AUTH.MISSING_REFRESH_TOKEN));
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
        const user = await User.findOne({ _id: decoded.id, refreshToken, deletedAt: null });
        if (!user) {
            return next(createError(401, MESSAGES.AUTH.INVALID_REFRESH_TOKEN));
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET_KEY,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json(
            createResponse(true, 200, MESSAGES.AUTH.REFRESH_TOKEN_SUCCESS, { accessToken })
        );
    } catch (error) {
        return next(createError(401, MESSAGES.AUTH.INVALID_REFRESH_TOKEN));
    }
});

export const authVerifyEmail = handleAsync(async (req, res, next) => {
    const { token } = req.params;
    if (!token) {
        return next(createError(400, MESSAGES.AUTH.INVALID_EMAIL_TOKEN));
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY_FOR_EMAIL);
        const user = await User.findOne({ _id: decoded.id, deletedAt: null });
        if (!user) {
            return next(createError(404, MESSAGES.AUTH.USER_NOT_EXISTS));
        }
        if (user.isVerifyEmail) {
            return next(createError(400, MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED));
        }

        await User.findByIdAndUpdate(decoded.id, { 
            isVerifyEmail: true, 
            updatedAt: new Date() 
        });
        return res.json(createResponse(true, 200, MESSAGES.AUTH.EMAIL_VERIFIED_SUCCESS));
    } catch (error) {
        return next(createError(400, MESSAGES.AUTH.INVALID_EMAIL_TOKEN));
    }
});

export const authForgotPassword = handleAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(createError(400, MESSAGES.AUTH.MISSING_FIELDS || "Email là bắt buộc"));
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(createError(400, MESSAGES.AUTH.INVALID_EMAIL));
    }
    
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
        return next(createError(404, MESSAGES.AUTH.USER_NOT_EXISTS));
    }

    const resetToken = jwt.sign(
        { id: user._id },
        JWT_SECRET_KEY_FOR_EMAIL,
        { expiresIn: "1h" }
    );

    await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
        updatedAt: new Date(),
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    try {
        await sendEmail(
            user.email,
            "Reset your password",
            `Hello ${user.fullName || "User"},\n\n
            Please click the link below to reset your password:\n
            ${resetLink}\n\n
            This link will expire in 1 hour. If you did not request a password reset, please ignore this email.\n\n
            Best regards,`
        );
        return res.json(createResponse(true, 200, MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS));
    } catch (error) {
        return next(createError(500, MESSAGES.AUTH.EMAIL_SEND_FAILED));
    }
});

export const authResetPassword = handleAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token) {
        return next(createError(400, MESSAGES.AUTH.INVALID_RESET_TOKEN));
    }
    
    if (!password) {
        return next(createError(400, MESSAGES.AUTH.MISSING_FIELDS || "Password là bắt buộc"));
    }
    
    // Password strength validation
    if (password.length < 6) {
        return next(createError(400, MESSAGES.AUTH.INVALID_PASSWORD));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY_FOR_EMAIL);
        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
            deletedAt: null,
        });

        if (!user) {
            return next(createError(400, MESSAGES.AUTH.INVALID_RESET_TOKEN));
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await User.findByIdAndUpdate(user._id, {
            password: hash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            updatedAt: new Date(),
        });

        return res.json(createResponse(true, 200, MESSAGES.AUTH.RESET_PASSWORD_SUCCESS));
    } catch (error) {
        return next(createError(400, MESSAGES.AUTH.INVALID_RESET_TOKEN));
    }
});