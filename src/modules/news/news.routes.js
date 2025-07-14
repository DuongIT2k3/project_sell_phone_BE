import { Router } from "express";
import {
    getPublishedNews,
    getAllNews,
    getNewsBySlug,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    restoreNews,
    togglePublishStatus,
    getRelatedNews
} from "./news.controller.js";
import { validBodyRequest } from "../../common/middlewares/validBodyRequest.js";
import { restrict } from "../../common/middlewares/restrict.js";
import { verifyUser } from "../../common/middlewares/verifyUser.js";
import { createNewsSchema, updateNewsSchema } from "./news.schema.js";

const newsRouter = Router();

// Public routes - Tin tức đã publish
newsRouter.get("/", getPublishedNews);
newsRouter.get("/slug/:slug", getNewsBySlug);
newsRouter.get("/related/:slug", getRelatedNews);

// Protected routes - Cần authentication và authorization
// Author và Admin có thể tạo tin tức
newsRouter.post(
    "/",
    verifyUser,
    restrict(["admin", "author"]),
    validBodyRequest(createNewsSchema),
    createNews
);

// Admin routes - Quản lý tin tức
newsRouter.get(
    "/admin",
    verifyUser,
    restrict(["admin"]),
    getAllNews
);

newsRouter.get(
    "/admin/:id",
    verifyUser,
    restrict(["admin"]),
    getNewsById
);

newsRouter.put(
    "/:id",
    verifyUser,
    restrict(["admin", "author"]),
    validBodyRequest(updateNewsSchema),
    updateNews
);

newsRouter.delete(
    "/:id",
    verifyUser,
    restrict(["admin"]),
    deleteNews
);

newsRouter.post(
    "/:id/restore",
    verifyUser,
    restrict(["admin"]),
    restoreNews
);

newsRouter.patch(
    "/:id/toggle-publish",
    verifyUser,
    restrict(["admin"]),
    togglePublishStatus
);

export default newsRouter;
