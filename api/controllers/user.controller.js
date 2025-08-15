import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import Notification from "../models/notification.model.js";

export const test = (req, res) => res.json({ message: "API is working!" });

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const paramId = req.params.id;

    if (userId !== paramId) {
      return next(errorHandler(401, "You can update only your own account!"));
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Create notification for admins about the profile update
    const admins = await User.find({ role: "admin" });

    // Create a notification for each admin
    const notificationPromises = admins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "User Profile Updated",
        message: `${updatedUser.full_name} has updated their profile.`,
        type: "profile_update",
        reference_id: updatedUser._id,
        reference_model: "User",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture || null,
    });
  } catch (error) {
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
