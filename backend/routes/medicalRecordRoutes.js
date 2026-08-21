import express from "express";
import {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/medicalRecordController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Doctor: Create medical record
router.post(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  createMedicalRecord
);

// Get medical records for a patient
router.get(
  "/patient/:patientId",
  authMiddleware,
  getPatientMedicalRecords
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  getPatientMedicalRecords
);

// Doctor: Update medical record
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor"),
  updateMedicalRecord
);

// Doctor or Admin: Delete medical record
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  deleteMedicalRecord
);

// Get single medical record
router.get("/:id", authMiddleware, getMedicalRecordById);

export default router;
