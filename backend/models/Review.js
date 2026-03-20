import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   { type: String, required: true, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
