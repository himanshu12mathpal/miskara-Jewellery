import express from 'express';
import {
  registerUser,
  verifyEmailAndRegister,
  resendRegistrationOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register',          registerUser);           // Step 1: send OTP
router.post('/verify-register',   verifyEmailAndRegister); // Step 2: verify OTP → save to DB
router.post('/resend-register-otp', resendRegistrationOTP); // Resend OTP
router.post('/login',             loginUser);
router.post('/forgot-password',   forgotPassword);
router.post('/reset-password',    resetPassword);
router.get('/profile',            protect, getUserProfile);
router.put('/profile',            protect, updateUserProfile);

export default router;