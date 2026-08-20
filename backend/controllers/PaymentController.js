import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { createPaymentOrder, verifyPaymentSignature } from "../services/paymentService.js";
import { createNotification } from "../services/notificationService.js";

// ================= CREATE PAYMENT ORDER =================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { appointmentId, paymentMethod = "razorpay" } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Appointment has already been paid for",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const amount = appointment.doctor?.consultationFee || 500;

    // Check if payment document already exists
    let payment = await Payment.findOne({ appointment: appointmentId });

    if (paymentMethod === "cash") {
      if (!payment) {
        payment = await Payment.create({
          patient: patient._id,
          doctor: appointment.doctor._id,
          appointment: appointment._id,
          amount,
          currency: "INR",
          paymentMethod: "cash",
          status: "pending",
        });
      } else {
        payment.paymentMethod = "cash";
        await payment.save();
      }

      return res.status(200).json({
        success: true,
        message: "Cash payment selected. Please pay at the clinic.",
        payment,
      });
    }

    // Razorpay order
    const order = await createPaymentOrder({
      amount,
      receipt: `appt_${appointmentId}`,
    });

    if (!payment) {
      payment = await Payment.create({
        patient: patient._id,
        doctor: appointment.doctor._id,
        appointment: appointment._id,
        amount,
        currency: order.currency || "INR",
        paymentMethod: "razorpay",
        status: "pending",
        razorpayOrderId: order.id,
      });
    } else {
      payment.razorpayOrderId = order.id;
      payment.paymentMethod = "razorpay";
      payment.status = "pending";
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      order,
      payment,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    let payment = await Payment.findOne({ appointment: appointmentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found for this appointment",
      });
    }

    // Validate signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId || payment.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      payment.status = "failed";
      payment.failureReason = "Signature verification failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    payment.status = "completed";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paidAt = new Date();
    await payment.save();

    // Update appointment payment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: "paid",
      paymentId: payment._id.toString(),
    });

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "doctor",
      populate: { path: "user" },
    });

    // Notify doctor & patient
    if (appointment?.doctor?.user) {
      createNotification({
        userId: appointment.doctor.user._id,
        type: "payment",
        title: "Payment Received",
        message: `Payment of ₹${payment.amount} received for appointment on ${new Date(
          appointment.appointmentDate
        ).toDateString()}.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error("Notification error:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully",
      payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// ================= GET LOGGED-IN PATIENT'S PAYMENTS =================
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(200).json({
        success: true,
        count: 0,
        payments: [],
      });
    }

    const payments = await Payment.find({ patient: patient._id })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get patient payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR EARNINGS & PAYMENTS =================
export const getDoctorEarnings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const payments = await Payment.find({
      doctor: doctor._id,
      status: "completed",
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate("appointment")
      .sort({ paidAt: -1 });

    const totalEarnings = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return res.status(200).json({
      success: true,
      totalEarnings,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get doctor earnings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch earnings",
      error: error.message,
    });
  }
};

// ================= GET PAYMENT BY ID =================
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email profileImage phone" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("appointment");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  getMyPayments,
  getDoctorEarnings,
  getPaymentById,
};
