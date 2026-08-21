import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';

/**
 * Create a real Razorpay Order
 * @param {object} params
 * @param {number} params.amount - in Rupees
 * @param {string} params.receipt - unique receipt identifier
 * @param {object} [params.notes] - optional metadata
 * @returns {Promise<object>}
 */
export const createOrder = async ({ amount, receipt, notes = {} }) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt,
      notes,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verify payment signature
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) return false;

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify webhook signature
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - x-razorpay-signature header
 * @param {string} webhookSecret - webhook secret key
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signature, webhookSecret) => {
  if (!rawBody || !signature || !webhookSecret) return false;

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(rawBody);
  const digest = shasum.digest('hex');

  return digest === signature;
};

export default {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
