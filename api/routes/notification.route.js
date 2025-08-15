import express from "express";
import {
  createNotification,
  getAdminNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUserNotifications,
  getUserUnreadCount,
  markAllUserNotificationsAsRead,
} from "../controllers/notification.controller.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

// Admin routes
router.post("/", verifyAdmin, createNotification);
router.get("/admin/:adminId", verifyAdmin, getAdminNotifications);
router.get("/admin/:adminId/unread", verifyAdmin, getUnreadCount);
router.put("/read/:id", verifyAdmin, markAsRead);
router.put("/admin/:adminId/read-all", verifyAdmin, markAllAsRead);
router.delete("/:id", verifyAdmin, deleteNotification);

// User routes
router.get("/user/:userId", verifyUser, getUserNotifications);
router.get("/user/:userId/unread", verifyUser, getUserUnreadCount);
router.put("/read/:id", verifyUser, markAsRead); // Reusing the same endpoint with different middleware
router.put(
  "/user/:userId/read-all",
  verifyUser,
  markAllUserNotificationsAsRead
);

export default router;
