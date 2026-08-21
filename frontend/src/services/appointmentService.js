import api from './api.js';

export const appointmentService = {
  getAvailableSlots: async (doctorId, date) => {
    return await api.get(`/appointments/slots/${doctorId}?date=${date}`);
  },

  bookAppointment: async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
  },

  getPatientAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/appointments/patient${query ? `?${query}` : ''}`);
  },

  getDoctorAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/appointments/doctor${query ? `?${query}` : ''}`);
  },

  getAppointmentById: async (id) => {
    return await api.get(`/appointments/${id}`);
  },

  confirmAppointment: async (id) => {
    return await api.put(`/appointments/${id}/confirm`);
  },

  completeAppointment: async (id) => {
    return await api.put(`/appointments/${id}/complete`);
  },

  cancelAppointment: async (id) => {
    return await api.put(`/appointments/${id}/cancel`);
  },

  getJoinToken: async (id) => {
    const offset = new Date().getTimezoneOffset();
    return await api.get(`/appointments/${id}/join-token?offset=${offset}`);
  },

  getLiveKitToken: async (id) => {
    return await api.get(`/appointments/${id}/livekit-token`);
  },

  endVideoCall: async (id) => {
    return await api.put(`/appointments/${id}/end-call`);
  },
};

export default appointmentService;
