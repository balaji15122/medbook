import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { JOIN_BUFFER_MINUTES } from "../config/videoCallConfig.js";
import { isSlotAvailable, getAvailableSlotsForDoctor } from "../services/appointmentService.js";
import { createNotification, notifyAppointmentUpdate } from "../services/notificationService.js";
import { sendAppointmentEmail } from "../services/emailService.js";

// ================= GET AVAILABLE SLOTS =================
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required (YYYY-MM-DD)",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const slots = await getAvailableSlotsForDoctor(doctorId, date);

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get available slots",
      error: error.message,
    });
  }
};

// ================= BOOK AN APPOINTMENT =================
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { doctorId, appointmentDate, startTime, endTime, reason } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID, appointment date, start time, and end time are required",
      });
    }

    // Find or create patient using logged-in user
    let patient = await Patient.findOne({ user: userId });
    if (!patient) {
      patient = await Patient.create({ user: userId });
    }

    // Check doctor
    const doctor = await Doctor.findById(doctorId).populate("user", "name email");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently not accepting appointments",
      });
    }

    // Check slot availability
    const slotCheck = await isSlotAvailable(doctorId, appointmentDate, startTime, endTime);
    if (!slotCheck.available) {
      return res.status(400).json({
        success: false,
        message: slotCheck.message,
      });
    }

    const date = new Date(appointmentDate);

    // Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate: date,
      startTime,
      endTime,
      reason: reason || "",
      status: "pending",
      paymentStatus: "pending",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      });

    // Notify doctor
    if (doctor.user) {
      const patientUser = await User.findById(userId);
      createNotification({
        userId: doctor.user._id,
        type: "appointment",
        title: "New Appointment Request",
        message: `${patientUser?.name || "A patient"} requested an appointment on ${date.toDateString()} at ${startTime}.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    // Notify patient
    createNotification({
      userId,
      type: "appointment",
      title: "Appointment Booking Submitted",
      message: `Your appointment request for ${date.toDateString()} at ${startTime} with Dr. ${doctor.user?.name || ""} is pending confirmation.`,
      relatedAppointment: appointment._id,
    }).catch((e) => console.error("Notification error:", e.message));

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// ================= GET PATIENT'S APPOINTMENTS =================
export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      return res.status(200).json({
        success: true,
        count: 0,
        appointments: [],
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { patient: patient._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
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
    console.error("Get patient appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
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

    const { status, date, page = 1, limit = 20 } = req.query;
    const filter = { doctor: doctor._id };
    if (status) filter.status = status;
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage phone" },
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ appointmentDate: 1, startTime: 1 });

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
    console.error("Get doctor appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// ================= GET SINGLE APPOINTMENT =================
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};

// ================= CONFIRM APPOINTMENT (Doctor) =================
export const confirmAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    }).populate({
      path: "patient",
      populate: { path: "user" },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm appointment in '${appointment.status}' status`,
      });
    }

    appointment.status = "confirmed";
    await appointment.save();

    // Notify patient
    if (appointment.patient?.user) {
      createNotification({
        userId: appointment.patient.user._id,
        type: "appointment",
        title: "Appointment Confirmed!",
        message: `Your appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.startTime} has been confirmed.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));

      sendAppointmentEmail(appointment.patient.user, req.user, appointment).catch(
        (e) => console.error("Email error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      appointment,
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
      error: error.message,
    });
  }
};

// ================= CANCEL APPOINTMENT (Patient or Doctor) =================
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user" },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    const doctor = await Doctor.findOne({ user: userId });

    const isPatient =
      patient && appointment.patient?._id?.toString() === patient._id.toString();
    const isDoctor =
      doctor && appointment.doctor?._id?.toString() === doctor._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status}`,
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Send notifications to the other party
    if (isPatient && appointment.doctor?.user) {
      createNotification({
        userId: appointment.doctor.user._id,
        type: "appointment",
        title: "Appointment Cancelled by Patient",
        message: `Appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.startTime} was cancelled by patient.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    } else if (isDoctor && appointment.patient?.user) {
      createNotification({
        userId: appointment.patient.user._id,
        type: "appointment",
        title: "Appointment Cancelled by Doctor",
        message: `Your appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.startTime} was cancelled by the doctor.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

// ================= COMPLETE APPOINTMENT (Doctor) =================
export const completeAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    }).populate({
      path: "patient",
      populate: { path: "user" },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be completed",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    // Notify patient
    if (appointment.patient?.user) {
      createNotification({
        userId: appointment.patient.user._id,
        type: "appointment",
        title: "Appointment Completed",
        message: `Your appointment with Dr. ${req.user.name || "your doctor"} has been marked as completed. Please leave a review!`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      appointment,
    });
  } catch (error) {
    console.error("Complete appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete appointment",
      error: error.message,
    });
  }
};

export const getJoinToken = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Cannot join video consultation unless appointment is confirmed",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    const doctor = await Doctor.findOne({ user: userId });

    const isPatient = patient && appointment.patient.toString() === patient._id.toString();
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to join this consultation room",
      });
    }

    const apptDate = new Date(appointment.appointmentDate);
    const [startHours, startMinutes] = appointment.startTime.split(":").map(Number);
    const [endHours, endMinutes] = appointment.endTime.split(":").map(Number);

    // Default client timezone offset to -330 (IST, UTC+5:30) if not provided by query
    const clientOffset = req.query.offset ? Number(req.query.offset) : -330;

    // Shift apptDate to extract correct local date components (correcting UTC timezone shifts)
    const clientLocalAppt = new Date(apptDate.getTime() - (clientOffset * 60 * 1000));

    const startTimeDate = new Date(Date.UTC(
      clientLocalAppt.getUTCFullYear(),
      clientLocalAppt.getUTCMonth(),
      clientLocalAppt.getUTCDate(),
      startHours,
      startMinutes,
      0,
      0
    ));

    const endTimeDate = new Date(Date.UTC(
      clientLocalAppt.getUTCFullYear(),
      clientLocalAppt.getUTCMonth(),
      clientLocalAppt.getUTCDate(),
      endHours,
      endMinutes,
      0,
      0
    ));

    const nowRaw = new Date();
    // Shift nowRaw into a date object whose UTC values match the client's local time values
    const clientLocalTime = new Date(nowRaw.getTime() - (clientOffset * 60 * 1000));
    
    const now = new Date(Date.UTC(
      clientLocalTime.getUTCFullYear(),
      clientLocalTime.getUTCMonth(),
      clientLocalTime.getUTCDate(),
      clientLocalTime.getUTCHours(),
      clientLocalTime.getUTCMinutes(),
      clientLocalTime.getUTCSeconds(),
      0
    ));
    const activeStart = new Date(startTimeDate.getTime() - JOIN_BUFFER_MINUTES * 60 * 1000);
    const activeEnd = endTimeDate;

    if (isPatient) {
      if (now < activeStart) {
        return res.status(403).json({
          success: false,
          message: "Consultation is not active yet",
          startTime: startTimeDate.toISOString(),
        });
      }

      if (now > activeEnd) {
        return res.status(403).json({
          success: false,
          message: "Consultation session has expired",
          endTime: endTimeDate.toISOString(),
        });
      }
    }

    const roomId = appointment.roomId || `room_${appointment._id}`;
    if (!appointment.roomId) {
      appointment.roomId = roomId;
      await appointment.save();
    }

    const token = jwt.sign(
      {
        appointmentId: appointment._id,
        userId: userId,
        role: req.user.role,
        roomId: roomId,
      },
      process.env.JWT_SECRET || "ERIEUHP9CEDRY7UW347jrdbjbgdhjfbirejheb",
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      roomId,
      token,
    });
  } catch (error) {
    console.error("Get join token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate join token",
      error: error.message,
    });
  }
};

export const endVideoCall = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    const doctor = await Doctor.findOne({ user: userId });

    const isPatient = patient && appointment.patient.toString() === patient._id.toString();
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    appointment.callEndedAt = new Date();
    if (isDoctor) {
      appointment.status = "completed";
    }
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Video call session ended successfully",
      appointment,
    });
  } catch (error) {
    console.error("End video call error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to end video call session",
      error: error.message,
    });
  }
};

export default {
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getJoinToken,
  endVideoCall,
};