import express from "express";
import {
  getMyPatientProfile,
  updatePatientProfile,
  getPatientById,
  getAllPatients,
  getPatientHistory,
} from "../controllers/patientController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Patient self-management routes
router.get("/me", authMiddleware, roleMiddleware("patient"), getMyPatientProfile);
router.put("/me", authMiddleware, roleMiddleware("patient"), updatePatientProfile);
router.get("/history", authMiddleware, roleMiddleware("patient"), getPatientHistory);

// Doctor / Admin routes
router.get(
  "/history/:patientId",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  getPatientHistory
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  getAllPatients
);
router.get("/:id", authMiddleware, getPatientById);

export default router;
