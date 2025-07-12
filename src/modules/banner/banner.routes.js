import { Router } from "express";
import {
    getListBanner,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    restoreBanner,
    toggleBannerStatus
} from "./banner.controller.js";
import { validBodyRequest } from "../../common/middlewares/validBodyRequest.js";
import { restrict } from "../../common/middlewares/restrict.js";
import { createBannerSchema, updateBannerSchema } from "./banner.schema.js";

const bannerRouter = Router();


bannerRouter.get("/", getListBanner);
bannerRouter.get("/:id", getBannerById);


bannerRouter.post(
    "/",
    restrict(["admin"]),
    validBodyRequest(createBannerSchema),
    createBanner
);

bannerRouter.put(
    "/:id",
    restrict(["admin"]),
    validBodyRequest(updateBannerSchema),
    updateBanner
);

bannerRouter.delete("/:id", restrict(["admin"]), deleteBanner);

bannerRouter.post("/:id/restore", restrict(["admin"]), restoreBanner);

bannerRouter.patch("/:id/toggle-status", restrict(["admin"]), toggleBannerStatus);

export default bannerRouter;
