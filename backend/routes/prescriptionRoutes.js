import express from "express";
import {
  createPrescription,
  getMyPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Doctor: Create prescription
router.post(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  createPrescription
);

// Patient: Get own prescriptions
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  getMyPrescriptions
);

// Doctor: Get issued prescriptions
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorPrescriptions
);

// Get by appointment ID
router.get(
  "/appointment/:appointmentId",
  authMiddleware,
  getPrescriptionByAppointment
);

// Doctor: Update prescription
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor"),
  updatePrescription
);

// Doctor or Admin: Delete prescription
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  deletePrescription
);

// Get single prescription
router.get("/:id", authMiddleware, getPrescriptionById);

export default router;
