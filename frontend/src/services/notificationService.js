import api from './api.js';

export const notificationService = {
  getMyNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },

  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
