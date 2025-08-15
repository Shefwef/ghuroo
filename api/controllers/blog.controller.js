import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";
import { supabaseStorage, uploadToSupabase } from "../utils/supabaseStorage.js";

export const upload = supabaseStorage;

export const createBlog = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, "User not authenticated"));
    }

    const blogData = {
      user_id: req.user.id,
      title: req.body.title,
      content: req.body.content,
      is_featured:
        req.body.is_featured === "true" || req.body.is_featured === true,
    };

    // Handle file uploads to Supabase
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbnailResult = await uploadToSupabase(
          req.files.thumbnail[0],
          "blogs"
        );
        blogData.thumbnail_url = thumbnailResult.publicUrl;
      }
      if (req.files.gallery && req.files.gallery.length > 0) {
        const galleryPromises = req.files.gallery.map((file) =>
          uploadToSupabase(file, "blogs")
        );
        const galleryResults = await Promise.all(galleryPromises);
        blogData.gallery_urls = galleryResults.map(
          (result) => result.publicUrl
        );
      }
    }

    const blog = await Blog.create(blogData);

    // Get user details for the notification
    const user = await User.findById(req.user.id);

    // Create notification for admins
    const admins = await User.find({ role: "admin" });

    // Create a notification for each admin
    const notificationPromises = admins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "New Blog Published",
        message: `${user.full_name} has published a new blog: "${blog.title}".`,
        type: "blog",
        reference_id: blog._id,
        reference_model: "Blog",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error("createBlog error:", error);
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "user_id",
      "full_name profilePicture"
    );

    if (!blog) return next(errorHandler(404, "Blog not found"));

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const getUserBlogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const blogs = await Blog.find({ user_id: userId }).sort({ created_at: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));

    if (blog.user_id.toString() !== req.user.id && !req.user.admin) {
      return next(errorHandler(403, "You can only update your own blogs"));
    }

    const updateData = req.body;

    if (req.files && req.files["thumbnail"]) {
      const thumbnailResult = await uploadToSupabase(
        req.files["thumbnail"][0],
        "blogs"
      );
      updateData.thumbnail_url = thumbnailResult.publicUrl;
    }

    if (req.files && req.files["gallery"]) {
      const galleryPromises = req.files["gallery"].map((file) =>
        uploadToSupabase(file, "blogs")
      );
      const galleryResults = await Promise.all(galleryPromises);
      updateData.gallery_urls = galleryResults.map(
        (result) => result.publicUrl
      );
    }

    if (updateData.is_featured !== undefined) {
      updateData.is_featured =
        updateData.is_featured === "true" || updateData.is_featured === true;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));

    if (blog.user_id.toString() !== req.user.id && !req.user.admin) {
      return next(errorHandler(403, "You can only delete your own blogs"));
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchBlogs = async (req, res, next) => {
  try {
    const { term } = req.params;

    if (!term) {
      return next(errorHandler(400, "Search term is required"));
    }

    const searchQuery = {
      $or: [
        { title: { $regex: term, $options: "i" } },
        { content: { $regex: term, $options: "i" } },
      ],
    };

    const blogs = await Blog.find(searchQuery)
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ is_featured: true })
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};
