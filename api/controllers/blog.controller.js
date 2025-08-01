import Blog from "../models/blog.model.js";

export const createBlog = async (req, res) => {
  try {
    const { user_id, title, content, is_featured } = req.body;
    const blog = await Blog.create({ user_id, title, content, is_featured });
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("user_id", "full_name profilePicture");
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const blogs = await Blog.find({ user_id: userId })
      .sort({ created_at: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};