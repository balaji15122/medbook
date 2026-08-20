import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";

// ================= CREATE PRESCRIPTION (Doctor) =================
export const createPrescription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      appointmentId,
      patientId,
      diagnosis,
      medicines,
      additionalInstructions,
      followUpDate,
    } = req.body;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required",
      });
    }

    let targetPatientId = patientId;
    let appointment = null;

    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId).populate({
        path: "patient",
        populate: { path: "user" },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      targetPatientId = appointment.patient._id;
    } else if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID or Patient ID is required",
      });
    }

    const prescription = await Prescription.create({
      doctor: doctor._id,
      patient: targetPatientId,
      appointment: appointmentId || null,
      diagnosis: diagnosis || "",
      medicines,
      additionalInstructions: additionalInstructions || "",
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      prescriptionDate: new Date(),
    });

    const populated = await Prescription.findById(prescription._id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      });

    // Notify patient
    const patientRecord = await Patient.findById(targetPatientId);
    if (patientRecord?.user) {
      createNotification({
        userId: patientRecord.user,
        type: "prescription",
        title: "New Prescription Added",
        message: `Dr. ${req.user.name || "your doctor"} has added a new prescription for you.`,
        relatedAppointment: appointmentId || null,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: populated,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};

// ================= GET LOGGED-IN PATIENT'S PRESCRIPTIONS =================
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(200).json({
        success: true,
        count: 0,
        prescriptions: [],
      });
    }

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment")
      .sort({ prescriptionDate: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get my prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR'S ISSUED PRESCRIPTIONS =================
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const prescriptions = await Prescription.find({ doctor: doctor._id })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage phone" },
      })
      .populate("appointment")
      .sort({ prescriptionDate: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get doctor prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// ================= GET PRESCRIPTION BY ID =================
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage phone dateOfBirth gender" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};

// ================= GET PRESCRIPTIONS BY APPOINTMENT ID =================
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      appointment: req.params.appointmentId,
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      });

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription by appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};

// ================= UPDATE PRESCRIPTION (Doctor) =================
export const updatePrescription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { diagnosis, medicines, additionalInstructions, followUpDate } = req.body;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const prescription = await Prescription.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found or not authorized to edit",
      });
    }

    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (medicines && Array.isArray(medicines)) prescription.medicines = medicines;
    if (additionalInstructions !== undefined) {
      prescription.additionalInstructions = additionalInstructions;
    }
    if (followUpDate !== undefined) {
      prescription.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update prescription",
      error: error.message,
    });
  }
};

// ================= DELETE PRESCRIPTION (Doctor / Admin) =================
export const deletePrescription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    let filter = { _id: id };
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      filter.doctor = doctor._id;
    }

    const deleted = await Prescription.findOneAndDelete(filter);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
      error: error.message,
    });
  }
};

export default {
  createPrescription,
  getMyPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  updatePrescription,
  deletePrescription,
};
