import User from '../models/user.model.js';
import Tour from '../models/tour.model.js';
import { errorHandler } from '../utils/error.js';

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
    const [userCount, tourCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Tour.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);

    const recentTours = await Tour.find()
      .populate('created_by', 'full_name')
      .sort({ created_at: -1 })
      .limit(5);

    res.json({
      userCount,
      tourCount,
      adminCount,
      recentTours
    });
  } catch (error) {
    next(error);
  }
};