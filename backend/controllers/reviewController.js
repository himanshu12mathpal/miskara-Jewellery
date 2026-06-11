import asyncHandler from 'express-async-handler';
import Review  from '../models/Review.js';
import Product from '../models/Product.js';

/* helper — recalculate avg rating on product */
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating:     Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  }
};

// @desc  Get reviews for a product
// @route GET /api/reviews/:productId
// @access Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc  Add review
// @route POST /api/reviews/:productId
// @access Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }

  const review = await Review.create({
    product: productId,
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    title,
    comment,
  });

  await updateProductRating(product._id);
  res.status(201).json(review);
});

// @desc  Update own review
// @route PUT /api/reviews/:reviewId
// @access Private
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  review.rating  = Number(req.body.rating)  || review.rating;
  review.title   = req.body.title   || review.title;
  review.comment = req.body.comment || review.comment;
  await review.save();
  await updateProductRating(review.product);
  res.json(review);
});

// @desc  Delete review (own or admin)
// @route DELETE /api/reviews/:reviewId
// @access Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductRating(productId);
  res.json({ message: 'Review deleted' });
});
