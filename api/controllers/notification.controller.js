import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";


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


export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return next(errorHandler(404, "Notification not found"));
    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};


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
