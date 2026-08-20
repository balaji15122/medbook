import crypto from "crypto";

/**
 * Create a payment order / reference
 * @param {object} params
 * @param {number} params.amount - in Rupees or currency unit
 * @param {string} params.receipt - receipt ID / appointment ID
 * @param {string} [params.currency] - default 'INR'
 */
export const createPaymentOrder = async ({ amount, receipt, currency = "INR" }) => {
  try {
    // If Razorpay keys are provided and razorpay SDK is installed, use Razorpay
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
          amount: Math.round(amount * 100), // Amount in paise
          currency,
          receipt,
        };

        const order = await instance.orders.create(options);
        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          isSimulated: false,
        };
      } catch (err) {
        console.warn("Razorpay order creation fallback:", err.message);
      }
    }

    // Default simulated order
    const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      id: simulatedOrderId,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      status: "created",
      isSimulated: true,
    };
  } catch (error) {
    console.error("Payment Order Error:", error.message);
    throw error;
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
  if (!orderId || !paymentId) return false;

  // If Razorpay secret is set, verify HMAC
  if (process.env.RAZORPAY_KEY_SECRET && signature) {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  }

  // For testing / simulated mode or cash payments
  return Boolean(paymentId);
};

export default {
  createPaymentOrder,
  verifyPaymentSignature,
};
