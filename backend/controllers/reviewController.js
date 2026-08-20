import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Recalculate doctor rating and total reviews
 */
const updateDoctorAverageRating = async (doctorId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { doctor: doctorId, isApproved: true } },
      {
        $group: {
          _id: "$doctor",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error("Failed to update doctor average rating:", err.message);
  }
};

// ================= CREATE REVIEW (Patient) =================
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and rating (1-5) are required",
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "doctor",
      populate: { path: "user" },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own appointments",
      });
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for completed appointments",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      patient: patient._id,
      appointment: appointment._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this appointment",
      });
    }

    const review = await Review.create({
      patient: patient._id,
      doctor: appointment.doctor._id,
      appointment: appointment._id,
      rating: numRating,
      comment: comment || "",
      isApproved: true,
    });

    // Update doctor's aggregated rating
    await updateDoctorAverageRating(appointment.doctor._id);

    // Notify doctor
    if (appointment.doctor?.user) {
      createNotification({
        userId: appointment.doctor.user._id,
        type: "system",
        title: "New Review Received",
        message: `A patient left a ${numRating}-star review for you: "${comment || "No comment"}"`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    const populatedReview = await Review.findById(review._id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name profileImage" },
      })
      .populate("doctor", "specialization qualification");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// ================= GET REVIEWS FOR A DOCTOR =================
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ doctor: doctorId, isApproved: true })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name profileImage" },
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ doctor: doctorId, isApproved: true });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      reviews,
    });
  } catch (error) {
    console.error("Get doctor reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// ================= GET LOGGED-IN PATIENT'S REVIEWS =================
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
      });
    }

    const reviews = await Review.find({ patient: patient._id })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews",
      error: error.message,
    });
  }
};

// ================= UPDATE REVIEW (Patient) =================
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const review = await Review.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized to edit",
      });
    }

    if (rating !== undefined) {
      const num = Number(rating);
      if (isNaN(num) || num < 1 || num > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5",
        });
      }
      review.rating = num;
    }

    if (comment !== undefined) review.comment = comment;

    await review.save();
    await updateDoctorAverageRating(review.doctor);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// ================= DELETE REVIEW (Patient or Admin) =================
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    let filter = { _id: id };

    if (req.user.role !== "admin") {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      filter.patient = patient._id;
    }

    const review = await Review.findOneAndDelete(filter);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized",
      });
    }

    await updateDoctorAverageRating(review.doctor);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

export default {
  createReview,
  getDoctorReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
