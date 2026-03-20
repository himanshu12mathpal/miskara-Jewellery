import api from './api.js';

export const reviewService = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  add:          (productId, data) => api.post(`/reviews/${productId}`, data),
  update:       (reviewId,  data) => api.put(`/reviews/${reviewId}`, data),
  delete:       (reviewId)        => api.delete(`/reviews/${reviewId}`),
};
