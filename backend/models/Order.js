import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'] },
      phone: { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'] },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Shipped', 'Delivered'],
      default: 'Pending',
    },
    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      isPaid: { type: Boolean, default: false },
      paidAt: Date,
    },
    refund: {
      isRefunded: { type: Boolean, default: false },
      refundId: String,
      refundedAt: Date,
      refundAmount: Number,
    },
    rejectionReason: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
