import jwt from "jsonwebtoken";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { generateLiveKitToken } from "../livekit.js";

/**
 * Service to manage video/audio streams and token generation (WebRTC Signaling + LiveKit SFU).
 */
class StreamService {
  /**
   * Generates a standard JWT token for room authentication.
   * @param {string} appointmentId
   * @param {string} userId
   * @param {string} role
   * @returns {Promise<object>} Token and Room Details
   */
  async getSignalingToken(appointmentId, userId, role) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status !== "confirmed") {
      throw new Error("Cannot join video consultation unless appointment is confirmed");
    }

    const patient = await Patient.findOne({ user: userId });
    const doctor = await Doctor.findOne({ user: userId });

    const isPatient = patient && appointment.patient.toString() === patient._id.toString();
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor) {
      throw new Error("You are not authorized to join this consultation room");
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
        role: role,
        roomId: roomId,
      },
      process.env.JWT_SECRET || "ERIEUHP9CEDRY7UW347jrdbjbgdhjfbirejheb",
      { expiresIn: "15m" }
    );

    return { roomId, token };
  }

  /**
   * Generates a LiveKit SFU Access Token for the participant.
   * @param {string} appointmentId
   * @param {string} userId
   * @param {string} userName
   * @returns {Promise<object>} LiveKit details (token and URL)
   */
  async getLiveKitToken(appointmentId, userId, userName) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const roomName = `room_${appointmentId}`;
    const participantName = userName || `user_${userId}`;

    const isConfigured = !!process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_KEY !== "devkey";
    const token = generateLiveKitToken(roomName, participantName);

    return {
      token,
      roomName,
      serverUrl: process.env.LIVEKIT_URL || "ws://localhost:7880",
      isLiveKitConfigured: isConfigured,
    };
  }
}

export const streamService = new StreamService();
export default streamService;
