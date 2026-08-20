import sendEmail from "../utils/sendEmail.js";

/**
 * Send welcome email to newly registered user
 */
export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to MedBook!";
  const text = `Hello ${user.name},\n\nWelcome to MedBook. Your account (${user.email}) has been successfully created as a ${user.role}.\n\nBest regards,\nMedBook Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Welcome to MedBook!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your account has been successfully created with the role: <strong>${user.role}</strong>.</p>
      <p>Start exploring available doctors, appointments, and medical records today.</p>
      <br />
      <p>Warm regards,<br><strong>MedBook Team</strong></p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send appointment confirmation email
 */
export const sendAppointmentEmail = async (patientUser, doctorUser, appointment) => {
  const subject = `MedBook Appointment Update: ${appointment.status.toUpperCase()}`;
  const text = `Hello ${patientUser.name},\n\nYour appointment with Dr. ${doctorUser?.name || "Doctor"} on ${new Date(
    appointment.appointmentDate
  ).toLocaleDateString()} at ${appointment.startTime} has been updated to: ${appointment.status}.\n\nMedBook Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Appointment Update</h2>
      <p>Hello <strong>${patientUser.name}</strong>,</p>
      <p>Your appointment has been updated:</p>
      <ul>
        <li><strong>Status:</strong> ${appointment.status}</li>
        <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</li>
      </ul>
      <br />
      <p>Warm regards,<br><strong>MedBook Team</strong></p>
    </div>
  `;

  return sendEmail({ to: patientUser.email, subject, text, html });
};

export default {
  sendWelcomeEmail,
  sendAppointmentEmail,
};
