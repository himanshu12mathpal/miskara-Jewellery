import api from './api.js';

export const productService = {
  getAll:       (params) => api.get('/products', { params }),
  getById:      (id)     => api.get(`/products/${id}`),
  getTopSellers:(limit)  => api.get('/products/top-sellers', { params: { limit } }),
  create:       (data)   => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:       (id)     => api.delete(`/products/${id}`),
  deleteImage:  (id, publicId) => api.delete(`/products/${id}/image/${encodeURIComponent(publicId)}`),
};