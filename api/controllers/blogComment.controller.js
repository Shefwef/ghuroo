import BlogComment from "../models/blogComment.model.js";

export const createBlogComment = async (req, res) => {
  try {
    const { blog_id, user_id, comment } = req.body;
    const blogComment = await BlogComment.create({ blog_id, user_id, comment });
    res.status(201).json({ success: true, data: blogComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await BlogComment.find({ blog_id: blogId })
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};