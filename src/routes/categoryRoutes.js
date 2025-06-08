import { Router } from "express";
import { createCategory, deleteCategory, getDetailCategory, getListCategory, softDeleteCategory, updateCategory } from "../controllers/categoryController.js";

const categoryRoutes = Router()

categoryRoutes.post("/", createCategory)
categoryRoutes.get("/", getListCategory)
categoryRoutes.get("/:id", getDetailCategory)
categoryRoutes.patch("/:id", updateCategory)
categoryRoutes.delete("/:id", deleteCategory)
categoryRoutes.delete("/soft-delete/:id", softDeleteCategory)

export default categoryRoutes