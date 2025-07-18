import { Router } from "express";
import {
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    getUserStatistics,
    deleteUser,
    softDeleteUser,
    restoreUser,
    getDeletedUsers,
    bulkSoftDeleteUsers,
    bulkRestoreUsers
} from "./user.controller.js";
import  validBodyRequest  from "../../common/middlewares/validBodyRequest.js";
import  restrict  from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";
import { updateProfileSchema, updateUserSchema } from "./user.schema.js";

const userRouter = Router();

// Protected routes - cần authentication
userRouter.use(verifyUser);

// User profile routes
userRouter.get("/profile", getProfile);
userRouter.put("/profile", validBodyRequest(updateProfileSchema), updateProfile);

// Admin routes - quản lý users
userRouter.get("/statistics", restrict(["admin", "superAdmin"]), getUserStatistics);
userRouter.get("/deleted", restrict(["admin", "superAdmin"]), getDeletedUsers);
userRouter.get("/", restrict(["admin", "superAdmin"]), getAllUsers);
userRouter.get("/:id", restrict(["admin", "superAdmin"]), getUserById);
userRouter.put("/:id", restrict(["admin", "superAdmin"]), validBodyRequest(updateUserSchema), updateUser);
userRouter.delete("/:id", restrict(["superAdmin"]), deleteUser);
userRouter.patch("/:id/soft-delete", restrict(["admin", "superAdmin"]), softDeleteUser);
userRouter.patch("/:id/restore", restrict(["admin", "superAdmin"]), restoreUser);
userRouter.patch("/:id/deactivate", restrict(["admin", "superAdmin"]), deactivateUser);
userRouter.patch("/:id/activate", restrict(["admin", "superAdmin"]), activateUser);

// Bulk operations
userRouter.patch("/bulk/soft-delete", restrict(["admin", "superAdmin"]), bulkSoftDeleteUsers);
userRouter.patch("/bulk/restore", restrict(["admin", "superAdmin"]), bulkRestoreUsers);

export default userRouter;