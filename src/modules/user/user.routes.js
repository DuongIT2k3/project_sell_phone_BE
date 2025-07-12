import { Router } from "express";
import {
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser
} from "./user.controller.js";
import { validBodyRequest } from "../../common/middlewares/validBodyRequest.js";
import { restrict } from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";
import { updateProfileSchema, updateUserSchema } from "./user.schema.js";

const userRouter = Router();

// Protected routes - cần authentication
userRouter.use(verifyUser);

// User profile routes
userRouter.get("/profile", getProfile);
userRouter.put("/profile", validBodyRequest(updateProfileSchema), updateProfile);

// Admin routes - quản lý users
userRouter.get("/", restrict(["admin", "superAdmin"]), getAllUsers);
userRouter.get("/:id", restrict(["admin", "superAdmin"]), getUserById);
userRouter.put("/:id", restrict(["admin", "superAdmin"]), validBodyRequest(updateUserSchema), updateUser);
userRouter.patch("/:id/deactivate", restrict(["admin", "superAdmin"]), deactivateUser);
userRouter.patch("/:id/activate", restrict(["admin", "superAdmin"]), activateUser);

export default userRouter;