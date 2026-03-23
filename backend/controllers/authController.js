import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { verifyEmailTpl, forgotPasswordTpl } from '../utils/emailTemplates.js';

// Temporary store for pending registrations (in-memory)
// Key: email, Value: { name, email, hashedPassword, phone, otp, otpExpire }
const pendingRegistrations = new Map();

// ── Step 1: Send OTP — do NOT save to DB yet ──────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if email already registered in DB
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('Email already registered'); }

  // Generate 6-digit OTP
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHashed = crypto.createHash('sha256').update(otp).digest('hex');
  const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Hash password before storing in memory
  const bcrypt       = await import('bcryptjs');
  const salt         = await bcrypt.default.genSalt(10);
  const hashedPwd    = await bcrypt.default.hash(password, salt);

  // Store in memory — NOT in DB
  pendingRegistrations.set(email, {
    name,
    email,
    hashedPassword: hashedPwd,
    phone: phone || '',
    otpHashed,
    otpExpire,
  });

  // Send OTP email
  try {
    await sendEmail({
      to: email,
      subject: 'Miskara — Verify Your Email to Complete Registration',
      html: verifyEmailTpl(name, otp),
    });
  } catch (err) {
    pendingRegistrations.delete(email);
    console.error('OTP email failed:', err.message);
    res.status(500);
    throw new Error('Failed to send verification email. Please try again.');
  }

  res.status(200).json({
    message: 'OTP sent to your email. Please verify to complete registration.',
    email,
  });
});

// ── Step 2: Verify OTP → NOW save to DB ───────────────────────
export const verifyEmailAndRegister = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const pending = pendingRegistrations.get(email);

  // No pending registration found
  if (!pending) {
    res.status(400);
    throw new Error('No pending registration found. Please register again.');
  }

  // OTP expired
  if (Date.now() > pending.otpExpire) {
    pendingRegistrations.delete(email);
    res.status(400);
    throw new Error('OTP has expired. Please register again.');
  }

  // Wrong OTP
  const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');
  if (hashedInput !== pending.otpHashed) {
    res.status(400);
    throw new Error('Invalid OTP. Please try again.');
  }

  // Double-check email not registered during OTP window
  const alreadyExists = await User.findOne({ email });
  if (alreadyExists) {
    pendingRegistrations.delete(email);
    res.status(400);
    throw new Error('Email already registered. Please login.');
  }

  // ── OTP correct — NOW create user in DB ──
  const user = await User.create({
    name:            pending.name,
    email:           pending.email,
    password:        pending.hashedPassword,
    phone:           pending.phone,
    isEmailVerified: true,   // already verified
  });

  // Clear from pending store
  pendingRegistrations.delete(email);

  res.status(201).json({
    _id:             user._id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    isEmailVerified: true,
    token:           generateToken(user._id),
    message:         'Email verified! Account created successfully.',
  });
});

// ── Resend OTP for pending registration ───────────────────────
export const resendRegistrationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const pending = pendingRegistrations.get(email);
  if (!pending) {
    res.status(400);
    throw new Error('No pending registration. Please register again.');
  }

  // Generate new OTP
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHashed = crypto.createHash('sha256').update(otp).digest('hex');
  const otpExpire = Date.now() + 10 * 60 * 1000;

  // Update pending store
  pendingRegistrations.set(email, { ...pending, otpHashed, otpExpire });

  await sendEmail({
    to:      email,
    subject: 'Miskara — New OTP for Email Verification',
    html:    verifyEmailTpl(pending.name, otp),
  });

  res.json({ message: 'New OTP sent to your email.' });
});

// ── Login ─────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id:             user._id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    isEmailVerified: user.isEmailVerified,
    token:           generateToken(user._id),
  });
});

// ── Forgot Password — send OTP ────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No account with that email'); }

  const otp = user.generateResetOTP();
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to:      user.email,
    subject: 'Miskara — Reset Your Password',
    html:    forgotPasswordTpl(user.name, otp),
  });

  res.json({ message: 'Password reset OTP sent to your email' });
});

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { otp, password } = req.body;
  const rawOtp = String(otp).trim();
  const hashed = crypto.createHash('sha256').update(rawOtp).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Invalid or expired OTP'); }

  user.password            = password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ message: 'Password reset successful! You can now log in.' });
});

// ── Get Profile ───────────────────────────────────────────────
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
});

// ── Update Profile ────────────────────────────────────────────
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name    = req.body.name    || user.name;
  user.phone   = req.body.phone   || user.phone;
  user.address = req.body.address || user.address;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    _id:             updated._id,
    name:            updated.name,
    email:           updated.email,
    role:            updated.role,
    isEmailVerified: updated.isEmailVerified,
    token:           generateToken(updated._id),
  });
});
