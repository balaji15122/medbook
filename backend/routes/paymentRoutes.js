import express from "express";
import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getDoctorEarnings,
  getPaymentById,
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Patient creates payment order
router.post(
  "/order",
  authMiddleware,
  roleMiddleware("patient"),
  createOrder
);

// Patient verifies payment
router.post(
  "/verify",
  authMiddleware,
  roleMiddleware("patient"),
  verifyPayment
);

// Patient gets their payments
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  getMyPayments
);

// Doctor views earnings
router.get(
  "/doctor/earnings",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorEarnings
);

// Get single payment
router.get("/:id", authMiddleware, getPaymentById);

export default router;
