import api from './api.js';

export const orderService = {
  createRazorpayOrder: (amount) => api.post('/orders/create-razorpay-order', { amount }),
  placeOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  // Admin
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};
