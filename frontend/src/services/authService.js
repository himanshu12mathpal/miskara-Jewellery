import api from './api.js';

export const authService = {
  register:           (data) => api.post('/auth/register', data),          // send OTP
  verifyRegister:     (data) => api.post('/auth/verify-register', data),   // verify OTP → create account
  resendRegisterOTP:  (data) => api.post('/auth/resend-register-otp', data),
  login:              (data) => api.post('/auth/login', data),
  forgotPassword:     (data) => api.post('/auth/forgot-password', data),
  resetPassword:      (data) => api.post('/auth/reset-password', data),
  getProfile:         ()     => api.get('/auth/profile'),
  updateProfile:      (data) => api.put('/auth/profile', data),
};