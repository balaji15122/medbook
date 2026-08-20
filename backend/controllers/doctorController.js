import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";

// ================= GET ALL DOCTORS =================
export const getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      city,
      search,
      minFee,
      maxFee,
      isAvailable,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isVerified: true,
    };

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    if (specialization) {
      filter.specialization = {
        $regex: specialization,
        $options: "i",
      };
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
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
      .populate("user", "name email profileImage")
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, totalReviews: -1 });

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
    console.error("Get all doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR BY ID =================
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email profileImage"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get recent approved reviews for this doctor
    const reviews = await Review.find({ doctor: doctor._id, isApproved: true })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name profileImage" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      doctor,
      reviews,
    });
  } catch (error) {
    console.error("Get doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};

// ================= GET LOGGED-IN DOCTOR'S PROFILE =================
export const getMyDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let doctor = await Doctor.findOne({
      user: userId,
    }).populate("user", "name email profileImage");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message,
    });
  }
};

// ================= UPDATE DOCTOR PROFILE =================
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      specialization,
      qualification,
      experience,
      licenseNumber,
      consultationFee,
      hospital,
      address,
      city,
      about,
      phone,
      profileImage,
      isAvailable,
    } = req.body;

    // Update user name / profileImage if given
    if (name || profileImage !== undefined) {
      const userUpdate = {};
      if (name) userUpdate.name = name.trim();
      if (profileImage !== undefined) userUpdate.profileImage = profileImage;
      await User.findByIdAndUpdate(userId, userUpdate);
    }

    let doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (licenseNumber !== undefined) doctor.licenseNumber = licenseNumber;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (hospital !== undefined) doctor.hospital = hospital;
    if (address !== undefined) doctor.address = address;
    if (city !== undefined) doctor.city = city;
    if (about !== undefined) doctor.about = about;
    if (phone !== undefined) doctor.phone = phone;
    if (profileImage !== undefined) doctor.profileImage = profileImage;
    if (typeof isAvailable === "boolean") doctor.isAvailable = isAvailable;

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id).populate(
      "user",
      "name email profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor profile",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR'S APPOINTMENTS =================
export const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const { status, date } = req.query;
    const filter = { doctor: doctor._id };

    if (status) filter.status = status;
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email profileImage",
        },
      })
      .sort({ appointmentDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR STATISTICS =================
export const getDoctorStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const [
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({ doctor: doctor._id, status: "completed" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "pending" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "confirmed" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "cancelled" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
      },
    });
  } catch (error) {
    console.error("Get doctor stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor statistics",
      error: error.message,
    });
  }
};

export default {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorStats,
};