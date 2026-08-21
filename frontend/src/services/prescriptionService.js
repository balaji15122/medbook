import api from './api.js';

export const prescriptionService = {
  createPrescription: async (data) => {
    return await api.post('/prescriptions', data);
  },

  getMyPrescriptions: async () => {
    return await api.get('/prescriptions/my');
  },

  getDoctorPrescriptions: async () => {
    return await api.get('/prescriptions/doctor');
  },

  getPrescriptionByAppointment: async (appointmentId) => {
    return await api.get(`/prescriptions/appointment/${appointmentId}`);
  },

  getPrescriptionById: async (id) => {
    return await api.get(`/prescriptions/${id}`);
  },

  updatePrescription: async (id, data) => {
    return await api.put(`/prescriptions/${id}`, data);
  },

  deletePrescription: async (id) => {
    return await api.delete(`/prescriptions/${id}`);
  },
};

export default prescriptionService;
