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
  getJoinToken,
  getLiveKitToken,
  endVideoCall,
} from "../controllers/appointmentController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
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

// Get join-token for video consultation
router.get(
  "/:id/join-token",
  authMiddleware,
  getJoinToken
);

// Get livekit-token for video consultation
router.get(
  "/:id/livekit-token",
  authMiddleware,
  getLiveKitToken
);

// End video call session
router.put(
  "/:id/end-call",
  authMiddleware,
  endVideoCall
);

// Get single appointment
router.get(
  "/:id",
  authMiddleware,
  getAppointmentById
);

export default router;