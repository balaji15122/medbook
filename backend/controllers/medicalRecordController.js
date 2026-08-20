import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { createNotification } from "../services/notificationService.js";

// ================= CREATE MEDICAL RECORD (Doctor) =================
export const createMedicalRecord = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      treatment,
      notes,
      attachments,
      recordDate,
    } = req.body;

    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis is required",
      });
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    let targetPatientId = patientId;

    if (appointmentId && !targetPatientId) {
      const appt = await Appointment.findById(appointmentId);
      if (appt) {
        targetPatientId = appt.patient;
      }
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const medicalRecord = await MedicalRecord.create({
      patient: targetPatientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      diagnosis,
      symptoms: symptoms || "",
      treatment: treatment || "",
      notes: notes || "",
      attachments: Array.isArray(attachments) ? attachments : [],
      recordDate: recordDate ? new Date(recordDate) : new Date(),
    });

    const populated = await MedicalRecord.findById(medicalRecord._id)
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
        type: "medical_record",
        title: "Medical Record Added",
        message: `Dr. ${req.user.name || "your doctor"} has added a medical record to your profile.`,
        relatedAppointment: appointmentId || null,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord: populated,
    });
  } catch (error) {
    console.error("Create medical record error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create medical record",
      error: error.message,
    });
  }
};

// ================= GET PATIENT MEDICAL RECORDS =================
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let patientId = req.params.patientId;

    // If patient is requesting without param, use their own profile
    if (!patientId && req.user.role === "patient") {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        return res.status(200).json({
          success: true,
          count: 0,
          medicalRecords: [],
        });
      }
      patientId = patient._id;
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID parameter is required",
      });
    }

    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment")
      .sort({ recordDate: -1 });

    return res.status(200).json({
      success: true,
      count: medicalRecords.length,
      medicalRecords,
    });
  } catch (error) {
    console.error("Get medical records error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

// ================= GET MEDICAL RECORD BY ID =================
export const getMedicalRecordById = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage phone dateOfBirth gender" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment");

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalRecord,
    });
  } catch (error) {
    console.error("Get medical record by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical record",
      error: error.message,
    });
  }
};

// ================= UPDATE MEDICAL RECORD (Doctor) =================
export const updateMedicalRecord = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { diagnosis, symptoms, treatment, notes, attachments } = req.body;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const record = await MedicalRecord.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found or not authorized to edit",
      });
    }

    if (diagnosis !== undefined) record.diagnosis = diagnosis;
    if (symptoms !== undefined) record.symptoms = symptoms;
    if (treatment !== undefined) record.treatment = treatment;
    if (notes !== undefined) record.notes = notes;
    if (attachments !== undefined && Array.isArray(attachments)) {
      record.attachments = attachments;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      medicalRecord: record,
    });
  } catch (error) {
    console.error("Update medical record error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medical record",
      error: error.message,
    });
  }
};

// ================= DELETE MEDICAL RECORD (Doctor / Admin) =================
export const deleteMedicalRecord = async (req, res) => {
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

    const deleted = await MedicalRecord.findOneAndDelete(filter);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    console.error("Delete medical record error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete medical record",
      error: error.message,
    });
  }
};

export default {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};
