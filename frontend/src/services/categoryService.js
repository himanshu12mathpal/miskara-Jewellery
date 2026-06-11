import api from './api.js';



export const categoryService = {

  getAll: () => api.get('/categories'),

  create: (name) => api.post('/categories', { name }),

  delete: (id) => api.delete(`/categories/${id}`),

};

