import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";

export const test = (req, res) => res.json({ message: "API is working!" });

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const paramId = req.params.id;

    if (userId !== paramId) {
      return next(errorHandler(401, "You can update only your own account!"));
    }

    const updates = { ...req.body };

    
    if (updates.username) {
      updates.full_name = updates.username;
      delete updates.username;
    }

    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    
    if (updates.password === '') {
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture || null,
    });
  } catch (error) {
    console.error('User update error:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const paramId = req.params.id;

    if (userId !== paramId) {
      return next(errorHandler(401, "You can delete only your own account!"));
    }

    await User.findByIdAndDelete(userId);
    res.clearCookie("access_token");
    res.status(200).json({ message: "User has been deleted successfully" });
  } catch (error) {
    next(error);
  }
};
