import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorStats,
} from "../controllers/doctorController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors);

// Doctor protected routes
router.get(
  "/profile/me",
  authMiddleware,
  roleMiddleware("doctor"),
  getMyDoctorProfile
);

router.put(
  "/profile/me",
  authMiddleware,
  roleMiddleware("doctor"),
  updateDoctorProfile
);

router.get(
  "/appointments",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorAppointments
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorStats
);

// Keep dynamic :id route LAST
router.get("/:id", getDoctorById);

export default router;