import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getUserBlogs,
  updateBlog,
  deleteBlog,
  searchBlogs,
  getFeaturedBlogs,
  upload
} from "../controllers/blog.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

// Create blog with file uploads
router.post("/", verifyUser, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), createBlog);

// Update blog with file uploads
router.put("/:id", verifyUser, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), updateBlog);

router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/search/:term", searchBlogs);
router.get("/:id", getBlogById);
router.get("/user/:userId", getUserBlogs);
router.delete("/:id", verifyUser, deleteBlog);

export default router;