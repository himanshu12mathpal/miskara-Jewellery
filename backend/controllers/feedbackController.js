import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
export const submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const feedback = await Feedback.create({
    user: req.user?._id,
    name,
    email,
    subject,
    message,
  });

  // Email to admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Feedback: ${subject}`,
    html: `
      <h2>New Feedback Received 📬</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr/>
      <small>Feedback ID: ${feedback._id}</small>
    `,
  });

  res.status(201).json({ message: 'Feedback submitted successfully!' });
});

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
// @access  Admin
export const getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbacks);
});

// @desc    Mark feedback as read
// @route   PUT /api/feedback/:id/read
// @access  Admin
export const markAsRead = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  res.json(feedback);
});
