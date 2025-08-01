import express from "express";
import {
  createBlogComment,
  getCommentsByBlog
} from "../controllers/blogComment.controller.js";

const router = express.Router();

router.post("/", createBlogComment);
router.get("/blog/:blogId", getCommentsByBlog);

export default router;