import User from '../models/user.model.js';
import Tour from '../models/tour.model.js';
import Blog from '../models/blog.model.js';
import { errorHandler } from '../utils/error.js';
import bcrypt from 'bcryptjs';

export const adminTest = (req, res) => res.json({ message: "Admin API is working!" });

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ created_at: -1 });
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!user) return next(errorHandler(404, 'User not found'));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    await Tour.deleteMany({ created_by: user._id });
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and associated tours deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, tourCount, blogCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Tour.countDocuments(),
      Blog.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);

    const recentTours = await Tour.find()
      .populate('created_by', 'full_name')
      .sort({ created_at: -1 })
      .limit(5);

    const recentBlogs = await Blog.find()
      .populate('user_id', 'full_name')
      .sort({ created_at: -1 })
      .limit(5);

    res.json({
      userCount,
      tourCount,
      blogCount,
      adminCount,
      recentTours,
      recentBlogs
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const paramId = req.params.id;

    if (adminId !== paramId) {
      return next(errorHandler(401, "You can update only your own admin account!"));
    }

    const updates = { ...req.body };

    // Map username to full_name for database compatibility
    if (updates.username) {
      updates.full_name = updates.username;
      delete updates.username;
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    // Remove empty password field if it exists
    if (updates.password === '') {
      delete updates.password;
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!updatedAdmin) {
      return next(errorHandler(404, "Admin not found"));
    }

    res.status(200).json({
      _id: updatedAdmin._id,
      username: updatedAdmin.full_name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      profilePicture: updatedAdmin.profilePicture || null
    });
  } catch (error) {
    console.error('Admin update error:', error);
    next(error);
  }
};

// Blog Management Functions
export const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("user_id", "full_name email profilePicture")
      .sort({ created_at: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogAdmin = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, 'Blog not found'));

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted successfully by admin' });
  } catch (error) {
    console.error('Admin deleteBlog error:', error);
    next(error);
  }
};