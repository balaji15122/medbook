import express from "express";
import {
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "../controllers/appointmentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public / slot check
router.get("/slots/:doctorId", getAvailableSlots);

// Patient routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("patient"),
  bookAppointment
);

router.get(
  "/patient",
  authMiddleware,
  roleMiddleware("patient"),
  getPatientAppointments
);

// Doctor routes
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorAppointments
);

router.put(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("doctor"),
  confirmAppointment
);

router.put(
  "/:id/complete",
  authMiddleware,
  roleMiddleware("doctor"),
  completeAppointment
);

// Patient or Doctor can cancel
router.put(
  "/:id/cancel",
  authMiddleware,
  cancelAppointment
);

// Get single appointment
router.get(
  "/:id",
  authMiddleware,
  getAppointmentById
);

export default router;