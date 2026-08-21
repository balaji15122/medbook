import api from './api.js';

export const paymentService = {
  createOrder: async (data) => {
    return await api.post('/payments/create-order', data);
  },

  verifyPayment: async (data) => {
    return await api.post('/payments/verify', data);
  },

  getMyPayments: async () => {
    return await api.get('/payments/my');
  },

  getDoctorEarnings: async () => {
    return await api.get('/payments/doctor/earnings');
  },

  getPaymentById: async (id) => {
    return await api.get(`/payments/${id}`);
  },
};

export default paymentService;
