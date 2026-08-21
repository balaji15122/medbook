import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get my notifications
router.get("/", getMyNotifications);

// Mark all as read
router.put("/read-all", markAllAsRead);

// Mark single notification as read
router.put("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
