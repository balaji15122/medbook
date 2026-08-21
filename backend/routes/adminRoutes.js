import express from "express";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllDoctors,
  verifyDoctor,
  getAllAppointments,
  getAllReviews,
  deleteReview,
} from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// Dashboard statistics
router.get("/stats", getAdminStats);

// Users management
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

// Doctors management & verification
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id/verify", verifyDoctor);

// Appointments management
router.get("/appointments", getAllAppointments);

// Reviews moderation
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;