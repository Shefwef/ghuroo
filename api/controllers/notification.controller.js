import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";

// Create a new notification
export const createNotification = async (req, res, next) => {
  try {
    const {
      recipient_id,
      title,
      message,
      type,
      reference_id,
      reference_model,
    } = req.body;

    if (!recipient_id || !title || !message) {
      return next(errorHandler(400, "Missing required fields"));
    }

    const notification = new Notification({
      recipient_id,
      title,
      message,
      type: type || "system",
      reference_id,
      reference_model,
    });

    await notification.save();
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Get all notifications for an admin
export const getAdminNotifications = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const notifications = await Notification.find({ recipient_id: adminId })
      .sort({ created_at: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications count for an admin
export const getUnreadCount = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const count = await Notification.countDocuments({
      recipient_id: adminId,
      is_read: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// Mark a notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    if (!notification) return next(errorHandler(404, "Notification not found"));
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for an admin
export const markAllAsRead = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const result = await Notification.updateMany(
      { recipient_id: adminId, is_read: false },
      { is_read: true }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return next(errorHandler(404, "Notification not found"));
    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Add these new functions for user notifications

// Get all notifications for a user
export const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipient_id: userId })
      .sort({ created_at: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Get unread notifications count for a user
export const getUserUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({
      recipient_id: userId,
      is_read: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for a user
export const markAllUserNotificationsAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await Notification.updateMany(
      { recipient_id: userId, is_read: false },
      { is_read: true }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
