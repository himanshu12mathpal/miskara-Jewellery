import express from 'express';
import {
  submitFeedback,
  getAllFeedback,
  markAsRead,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/', protect, adminOnly, getAllFeedback);
router.put('/:id/read', protect, adminOnly, markAsRead);

export default router;
