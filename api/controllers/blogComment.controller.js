import BlogComment from "../models/blogComment.model.js";
import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";
import Notification from "../models/notification.model.js";

export const createBlogComment = async (req, res) => {
  try {
    const { blog_id, user_id, comment } = req.body;
    const blogComment = await BlogComment.create({ blog_id, user_id, comment });

    
    const [blog, user] = await Promise.all([
      Blog.findById(blog_id),
      User.findById(user_id),
    ]);

    
    const admins = await User.find({ role: "admin" });

    
    const notificationPromises = admins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "New Blog Comment",
        message: `${user.full_name} commented on the blog "${blog.title}".`,
        type: "blog_comment",
        reference_id: blogComment._id,
        reference_model: "BlogComment",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

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
