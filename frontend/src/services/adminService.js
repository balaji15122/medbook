import api from './api.js';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/users${query ? `?${query}` : ''}`);
  },

  toggleUserStatus: async (id) => {
    return await api.put(`/admin/users/${id}/toggle-status`);
  },

  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },

  getAllDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/doctors${query ? `?${query}` : ''}`);
  },

  verifyDoctor: async (id, isVerified = true) => {
    return await api.put(`/admin/doctors/${id}/verify`, { isVerified });
  },

  getAllAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/appointments${query ? `?${query}` : ''}`);
  },

  getAllReviews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/admin/reviews${query ? `?${query}` : ''}`);
  },

  deleteReview: async (id) => {
    return await api.delete(`/admin/reviews/${id}`);
  },
};

export default adminService;
