import express from "express";
import {
  createReview,
  getDoctorReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public: View doctor reviews
router.get("/doctor/:doctorId", getDoctorReviews);

// Patient submits review
router.post(
  "/",
  authMiddleware,
  roleMiddleware("patient"),
  createReview
);

// Patient views their own reviews
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  getMyReviews
);

// Patient updates review
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("patient"),
  updateReview
);

// Patient or Admin deletes review
router.delete(
  "/:id",
  authMiddleware,
  deleteReview
);

export default router;
