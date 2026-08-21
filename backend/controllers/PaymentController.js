import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { createOrder, verifyPaymentSignature, verifyWebhookSignature } from '../services/paymentService.js';
import { createNotification } from '../services/notificationService.js';

// ================= CREATE RAZORPAY ORDER =================
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required',
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authenticate the patient and verify profile ownership
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Verify appointment ownership
    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this appointment',
      });
    }

    // Check payment status
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Appointment has already been paid for',
      });
    }

    // Retrieve fee directly from Doctor profile (never trust frontend amount)
    const amount = appointment.doctor?.consultationFee || 500;

    // Check duplicate completed payments
    let payment = await Payment.findOne({ appointment: appointmentId });
    if (payment && payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this appointment',
      });
    }

    // Create Razorpay Order via SDK
    const order = await createOrder({
      amount,
      receipt: `receipt_appt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        patientId: patient._id.toString(),
        doctorId: appointment.doctor._id.toString(),
      },
    });

    if (!payment) {
      payment = await Payment.create({
        patient: patient._id,
        doctor: appointment.doctor._id,
        appointment: appointment._id,
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'pending',
        razorpayOrderId: order.id,
      });
    } else {
      payment.razorpayOrderId = order.id;
      payment.paymentMethod = 'razorpay';
      payment.status = 'pending';
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId: appointment._id,
      patient: {
        name: req.user.name || '',
        email: req.user.email || '',
      },
      doctor: {
        name: appointment.doctor?.name || '',
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

// ================= VERIFY PAYMENT SIGNATURE =================
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment response parameters',
      });
    }

    // Find the corresponding payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this order ID',
      });
    }

    // Verify authenticated patient ownership
    const patient = await Patient.findOne({ user: userId });
    if (!patient || payment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment signature verification attempt',
      });
    }

    // Validate Signature via crypto HMAC
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      payment.status = 'failed';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }

    // Complete transaction
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    // Mark appointment as paid & confirmed
    const appointment = await Appointment.findByIdAndUpdate(
      payment.appointment,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: payment._id.toString(),
      },
      { new: true }
    ).populate({
      path: 'doctor',
      populate: { path: 'user' },
    });

    // Notify patient
    if (appointment) {
      const doctorName = appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor';
      createNotification({
        userId,
        type: 'payment',
        title: 'Appointment Confirmed',
        message: `Your appointment with ${doctorName} has been confirmed successfully.`,
        relatedAppointment: appointment._id,
      }).catch((e) => console.error('Notification error:', e.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      payment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment signature',
      error: error.message,
    });
  }
};

// ================= GET PAYMENT BY APPOINTMENT =================
export const getPaymentByAppointment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { appointmentId } = req.params;

    const payment = await Payment.findOne({ appointment: appointmentId })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email specialization' },
      })
      .populate('appointment');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment details not found for this appointment',
      });
    }

    // Authorize roles (Patient owns it, Doctor associated with it, or Admin)
    const [patientProfile, doctorProfile] = await Promise.all([
      Patient.findOne({ user: userId }),
      Doctor.findOne({ user: userId }),
    ]);

    const isAuthorized =
      req.user.role === 'admin' ||
      (patientProfile && payment.patient.toString() === patientProfile._id.toString()) ||
      (doctorProfile && payment.doctor.toString() === doctorProfile._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this payment details record',
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Get payment by appointment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details',
      error: error.message,
    });
  }
};

// ================= RAZORPAY WEBHOOK HANDLER =================
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature validation aborted: Missing inputs',
      });
    }

    // Verify webhook signature using raw body buffer
    const isValid = verifyWebhookSignature(req.rawBody, signature, webhookSecret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const payload = req.body;
    const event = payload.event;

    // Handle payment success capture
    if (event === 'order.paid') {
      const orderEntity = payload.payload.order.entity;
      const orderId = orderEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.paidAt = new Date();
        await payment.save();

        const appointment = await Appointment.findByIdAndUpdate(
          payment.appointment,
          {
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentId: payment._id.toString(),
          },
          { new: true }
        ).populate({
          path: 'patient',
          populate: { path: 'user' },
        }).populate({
          path: 'doctor',
          populate: { path: 'user' },
        });

        if (appointment && appointment.patient?.user) {
          const doctorName = appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor';
          createNotification({
            userId: appointment.patient.user._id,
            type: 'payment',
            title: 'Appointment Confirmed',
            message: `Your appointment with ${doctorName} has been confirmed successfully.`,
            relatedAppointment: appointment._id,
          }).catch((e) => console.error('Webhook notification error:', e.message));
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook event processing failed',
      error: error.message,
    });
  }
};

// ================= PRESERVED USER PAYMENTS LISTS =================
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(200).json({ success: true, count: 0, payments: [] });
    }

    const payments = await Payment.find({ patient: patient._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email profileImage' },
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Get patient payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};

export const getDoctorEarnings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const payments = await Payment.find({ doctor: doctor._id, status: 'completed' })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('appointment')
      .sort({ paidAt: -1 });

    const totalEarnings = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return res.status(200).json({
      success: true,
      totalEarnings,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Get doctor earnings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message,
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email profileImage phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email profileImage' },
      })
      .populate('appointment');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message,
    });
  }
};

export default {
  createRazorpayOrder,
  verifyPayment,
  getPaymentByAppointment,
  handleRazorpayWebhook,
  getMyPayments,
  getDoctorEarnings,
  getPaymentById,
};
