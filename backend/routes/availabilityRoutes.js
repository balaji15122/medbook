import express from "express";
import {
  createAvailability,
  bulkSetAvailability,
  getMyAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availabilityController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Doctor: Create availability
router.post(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  createAvailability
);

// Doctor: Bulk set availability
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware("doctor"),
  bulkSetAvailability
);

// Doctor: Get own availability
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("doctor"),
  getMyAvailability
);

// Patient / Public: View a doctor's availability
router.get(
  "/doctor/:doctorId",
  getDoctorAvailability
);

// Doctor: Update availability
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor"),
  updateAvailability
);

// Doctor: Delete availability
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("doctor"),
  deleteAvailability
);

export default router;