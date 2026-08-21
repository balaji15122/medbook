import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentByAppointment,
  handleRazorpayWebhook,
  getMyPayments,
  getDoctorEarnings,
  getPaymentById,
} from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public Webhook listener (exempt from authMiddleware since signature verified with SHA256 secret)
router.post('/webhook', handleRazorpayWebhook);

// Patient creates Razorpay order
router.post('/create-order', authMiddleware, roleMiddleware('patient'), createRazorpayOrder);

// Patient verifies signature
router.post('/verify', authMiddleware, roleMiddleware('patient'), verifyPayment);

// Retrieve payment record by appointment ID
router.get('/appointment/:appointmentId', authMiddleware, getPaymentByAppointment);

// Patient fetches their payment history
router.get('/my', authMiddleware, roleMiddleware('patient'), getMyPayments);

// Doctor fetches their earnings overview
router.get('/doctor/earnings', authMiddleware, roleMiddleware('doctor'), getDoctorEarnings);

// Single transaction lookup
router.get('/:id', authMiddleware, getPaymentById);

export default router;
