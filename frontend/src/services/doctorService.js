import api from './api.js';

export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.specialization) query.append('specialization', params.specialization);
    if (params.city) query.append('city', params.city);
    if (params.minFee) query.append('minFee', params.minFee);
    if (params.maxFee) query.append('maxFee', params.maxFee);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return await api.get(`/doctors${queryString ? `?${queryString}` : ''}`);
  },

  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },

  getMyDoctorProfile: async () => {
    return await api.get('/doctors/profile/me');
  },

  updateDoctorProfile: async (data) => {
    return await api.put('/doctors/profile/me', data);
  },

  getDoctorAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/doctors/appointments${query ? `?${query}` : ''}`);
  },

  getDoctorStats: async () => {
    return await api.get('/doctors/stats');
  },

  // Availability
  getMyAvailability: async () => {
    return await api.get('/availability/my');
  },

  getDoctorAvailability: async (doctorId) => {
    return await api.get(`/availability/doctor/${doctorId}`);
  },

  createAvailability: async (data) => {
    return await api.post('/availability', data);
  },

  bulkSetAvailability: async (schedules) => {
    return await api.post('/availability/bulk', { schedules });
  },

  updateAvailability: async (id, data) => {
    return await api.put(`/availability/${id}`, data);
  },

  deleteAvailability: async (id) => {
    return await api.delete(`/availability/${id}`);
  },
};

export default doctorService;
