import express from 'express';
import {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:productId',           getProductReviews);
router.post('/:productId',  protect, addReview);
router.put('/:reviewId',    protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;
