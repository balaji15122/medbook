import Patient from "../models/Patient.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import MedicalRecord from "../models/MedicalRecord.js";

// ================= GET LOGGED-IN PATIENT PROFILE =================
export const getMyPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let patient = await Patient.findOne({ user: userId }).populate(
      "user",
      "name email profileImage role"
    );

    // If patient record doesn't exist yet for some reason, auto-create one
    if (!patient) {
      patient = await Patient.create({ user: userId });
      patient = await Patient.findById(patient._id).populate(
        "user",
        "name email profileImage role"
      );
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient profile",
      error: error.message,
    });
  }
};

// ================= UPDATE LOGGED-IN PATIENT PROFILE =================
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      address,
      city,
      profileImage,
      emergencyContact,
      allergies,
      chronicConditions,
    } = req.body;

    // Update User name & profile image if provided
    if (name || profileImage !== undefined) {
      const userUpdate = {};
      if (name) userUpdate.name = name.trim();
      if (profileImage !== undefined) userUpdate.profileImage = profileImage;
      await User.findByIdAndUpdate(userId, userUpdate);
    }

    let patient = await Patient.findOne({ user: userId });

    if (!patient) {
      patient = new Patient({ user: userId });
    }

    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (phone !== undefined) patient.phone = phone;
    if (address !== undefined) patient.address = address;
    if (city !== undefined) patient.city = city;
    if (profileImage !== undefined) patient.profileImage = profileImage;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
    if (allergies !== undefined) patient.allergies = Array.isArray(allergies) ? allergies : [allergies];
    if (chronicConditions !== undefined) {
      patient.chronicConditions = Array.isArray(chronicConditions)
        ? chronicConditions
        : [chronicConditions];
    }

    await patient.save();

    const updatedPatient = await Patient.findById(patient._id).populate(
      "user",
      "name email profileImage role"
    );

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update patient profile",
      error: error.message,
    });
  }
};

// ================= GET PATIENT BY ID (Doctor / Admin) =================
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).populate(
      "user",
      "name email profileImage role"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
};

// ================= GET ALL PATIENTS (Admin / Doctor) =================
export const getAllPatients = async (req, res) => {
  try {
    const { search, city, bloodGroup, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const skip = (Number(page) - 1) * Number(limit);

    const patients = await Patient.find(filter)
      .populate("user", "name email profileImage")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      patients,
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

// ================= GET PATIENT MEDICAL HISTORY =================
export const getPatientHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let patientId = req.params.patientId;

    if (!patientId) {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      patientId = patient._id;
    }

    const [appointments, prescriptions, medicalRecords] = await Promise.all([
      Appointment.find({ patient: patientId })
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email profileImage" },
        })
        .sort({ appointmentDate: -1 }),
      Prescription.find({ patient: patientId })
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email profileImage" },
        })
        .sort({ prescriptionDate: -1 }),
      MedicalRecord.find({ patient: patientId })
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email profileImage" },
        })
        .sort({ recordDate: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      history: {
        appointments,
        prescriptions,
        medicalRecords,
      },
    });
  } catch (error) {
    console.error("Get patient history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient history",
      error: error.message,
    });
  }
};

export default {
  getMyPatientProfile,
  updatePatientProfile,
  getPatientById,
  getAllPatients,
  getPatientHistory,
};
