/**
 * Send Email utility
 * @param {object} options { to, subject, text, html }
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // In production or when SMTP is configured, nodemailer can be used
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Dynamic import of nodemailer if configured
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"MedBook Support" <noreply@medbook.com>',
        to,
        subject,
        text,
        html,
      });

      console.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error("Send Email Error:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
