import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getUserBlogs
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/", createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.get("/user/:userId", getUserBlogs);

export default router;