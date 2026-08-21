import api from './api.js';

export const patientService = {
  getMyProfile: async () => {
    return await api.get('/patients/me');
  },

  updateMyProfile: async (data) => {
    return await api.put('/patients/me', data);
  },

  getMyHistory: async () => {
    return await api.get('/patients/history');
  },

  getPatientHistory: async (patientId) => {
    return await api.get(`/patients/history/${patientId}`);
  },

  getAllPatients: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/patients${query ? `?${query}` : ''}`);
  },

  getPatientById: async (id) => {
    return await api.get(`/patients/${id}`);
  },

  // Medical Records
  getMyMedicalRecords: async () => {
    return await api.get('/medical-records/my');
  },

  getPatientMedicalRecords: async (patientId) => {
    return await api.get(`/medical-records/patient/${patientId}`);
  },

  createMedicalRecord: async (data) => {
    return await api.post('/medical-records', data);
  },

  // Reviews
  createReview: async (data) => {
    return await api.post('/reviews', data);
  },

  getMyReviews: async () => {
    return await api.get('/reviews/my');
  },
};

export default patientService;
