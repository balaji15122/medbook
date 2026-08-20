import Notification from "../models/Notification.js";

/**
 * Create a notification for a user
 * @param {object} params
 * @param {string} params.userId - User ObjectId
 * @param {string} params.type - 'appointment' | 'payment' | 'prescription' | 'medical_record' | 'system'
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.relatedAppointment] - Optional Appointment ObjectId
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedAppointment = null,
}) => {
  try {
    if (!userId || !type || !title || !message) {
      console.warn("Missing required parameters for notification creation");
      return null;
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedAppointment,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    return null;
  }
};

/**
 * Notify user about appointment events
 */
export const notifyAppointmentUpdate = async (userId, appointmentId, status, details = "") => {
  const titles = {
    booked: "New Appointment Booked",
    confirmed: "Appointment Confirmed",
    cancelled: "Appointment Cancelled",
    completed: "Appointment Completed",
    rejected: "Appointment Rejected",
  };

  const title = titles[status] || `Appointment ${status}`;
  const message = details || `Your appointment status has been updated to ${status}.`;

  return createNotification({
    userId,
    type: "appointment",
    title,
    message,
    relatedAppointment: appointmentId,
  });
};

export default {
  createNotification,
  notifyAppointmentUpdate,
};
