import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import { createNotification } from "../services/notificationService.js";

// ================= GET ADMIN DASHBOARD STATS =================
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      totalReviews,
      payments,
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ isVerified: true }),
      Doctor.countDocuments({ isVerified: false }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Review.countDocuments(),
      Payment.find({ status: "completed" }).select("amount"),
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          verifiedDoctors,
          pendingDoctors,
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          cancelled: cancelledAppointments,
        },
        reviews: {
          total: totalReviews,
        },
        finance: {
          totalRevenue,
          completedTransactions: payments.length,
        },
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error.message,
    });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "patient") {
      await Patient.findOneAndDelete({ user: user._id });
    } else if (user.role === "doctor") {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `User ${user.email} and associated data deleted successfully`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// ================= TOGGLE USER ACTIVE STATUS =================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// ================= GET ALL DOCTORS (ADMIN VIEW) =================
export const getAllDoctors = async (req, res) => {
  try {
    const { isVerified, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isVerified !== undefined) {
      filter.isVerified = isVerified === "true";
    }

    if (search) {
      filter.$or = [
        { specialization: { $regex: search, $options: "i" } },
        { hospital: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const doctors = await Doctor.find(filter)
      .populate("user", "name email profileImage isActive")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      doctors,
    });
  } catch (error) {
    console.error("Admin get all doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// ================= VERIFY DOCTOR =================
export const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified = true } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isVerified: Boolean(isVerified) },
      { new: true }
    ).populate("user", "name email");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.user) {
      createNotification({
        userId: doctor.user._id,
        type: "system",
        title: isVerified ? "Doctor Profile Verified" : "Verification Revoked",
        message: isVerified
          ? "Congratulations! Your doctor profile has been verified by the MedBook administrator."
          : "Your verified status has been updated by the administrator.",
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: `Doctor ${doctor.isVerified ? "verified" : "unverified"} successfully`,
      doctor,
    });
  } catch (error) {
    console.error("Verify doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify doctor",
      error: error.message,
    });
  }
};

// ================= GET ALL APPOINTMENTS =================
export const getAllAppointments = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ appointmentDate: -1, startTime: -1 });

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      appointments,
    });
  } catch (error) {
    console.error("Admin get all appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// ================= GET ALL REVIEWS =================
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find()
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      reviews,
    });
  } catch (error) {
    console.error("Admin get all reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// ================= DELETE REVIEW =================
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Recalculate doctor rating
    const stats = await Review.aggregate([
      { $match: { doctor: review.doctor, isApproved: true } },
      {
        $group: {
          _id: "$doctor",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(review.doctor, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await Doctor.findByIdAndUpdate(review.doctor, {
        rating: 0,
        totalReviews: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

export default {
  getAdminStats,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllDoctors,
  verifyDoctor,
  getAllAppointments,
  getAllReviews,
  deleteReview,
};
