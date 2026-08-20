import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import { generateTimeSlots, timeToMinutes } from "../utils/generateSlots.js";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Get available time slots for a doctor on a specific date
 * @param {string} doctorId
 * @param {Date|string} dateInput
 * @returns {Promise<Array>}
 */
export const getAvailableSlotsForDoctor = async (doctorId, dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

  // Find doctor's availability schedule for that day
  const availability = await Availability.findOne({
    doctor: doctorId,
    dayOfWeek,
    isAvailable: true,
  });

  if (!availability) {
    return [];
  }

  // Get start of day and end of day in UTC/Date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Find existing appointments on that date
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  });

  return generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration || 30,
    bookedAppointments
  );
};

/**
 * Check if a requested time slot is valid and available
 */
export const isSlotAvailable = async (doctorId, dateInput, startTime, endTime) => {
  const date = new Date(dateInput);
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

  const availability = await Availability.findOne({
    doctor: doctorId,
    dayOfWeek,
    isAvailable: true,
  });

  if (!availability) {
    return { available: false, message: `Doctor is not available on ${dayOfWeek}` };
  }

  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);
  const availStart = timeToMinutes(availability.startTime);
  const availEnd = timeToMinutes(availability.endTime);

  if (requestedStart < availStart || requestedEnd > availEnd) {
    return { available: false, message: "Requested time is outside doctor's working hours" };
  }

  if (requestedStart >= requestedEnd) {
    return { available: false, message: "Start time must be before end time" };
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const overlappingAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "confirmed"] },
  });

  const hasConflict = overlappingAppointments.some((appt) => {
    const apptStart = timeToMinutes(appt.startTime);
    const apptEnd = timeToMinutes(appt.endTime);
    return requestedStart < apptEnd && requestedEnd > apptStart;
  });

  if (hasConflict) {
    return { available: false, message: "This time slot has already been booked" };
  }

  return { available: true };
};

export default {
  getAvailableSlotsForDoctor,
  isSlotAvailable,
};
