import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { razorpayInstance } from '../utils/razorpay.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  orderConfirmUserTpl,
  orderAlertAdminTpl,
  orderStatusTpl,
} from '../utils/emailTemplates.js';

// ── Create Razorpay order ──────────────────────
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  // Check keys are set
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    res.status(500);
    throw new Error('Payment gateway not configured. Please contact support.');
  }

  try {
    const options = {
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    };
    const rzpOrder = await razorpayInstance.orders.create(options);
    res.json(rzpOrder);
  } catch (err) {
    console.error('Razorpay order create error:', err);
    res.status(502);
    throw new Error('Payment gateway error. Please try again.');
  }
});

// ── Place order after payment ──────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, totalAmount,
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
  } = req.body;

  // Verify Razorpay signature
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    totalAmount,
    payment: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isPaid:  true,
      paidAt:  Date.now(),
    },
    status: 'Pending',
  });

  // Reduce stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Email to USER
  try {
    await sendEmail({
      to:      req.user.email,
      subject: `Miskara — Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
      html:    orderConfirmUserTpl(req.user.name, order),
    });
  } catch (e) { console.error('User order email failed:', e.message); }

  // Email to ADMIN
  try {
    await sendEmail({
      to:      process.env.ADMIN_EMAIL,
      subject: `New Order — ₹${totalAmount.toLocaleString('en-IN')} — ${req.user.name}`,
      html:    orderAlertAdminTpl(order, req.user),
    });
  } catch (e) { console.error('Admin order email failed:', e.message); }

  res.status(201).json(order);
});

// ── Get my orders ──────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// ── Get order by ID ────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json(order);
});

// ── Get all orders (admin) ─────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// ── Update order status (admin) ────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.status = status;
  if (rejectionReason) order.rejectionReason = rejectionReason;

  // Auto-refund on rejection
  if (status === 'Rejected' && order.payment.isPaid && !order.refund?.isRefunded) {
    try {
      const refund = await razorpayInstance.payments.refund(
        order.payment.razorpay_payment_id,
        {
          amount: Math.round(order.totalAmount * 100),
          notes:  { reason: rejectionReason || 'Order rejected' },
        }
      );
      order.refund = {
        isRefunded:   true,
        refundId:     refund.id,
        refundedAt:   new Date(),
        refundAmount: order.totalAmount,
      };
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    } catch (err) { console.error('Refund error:', err.message); }
  }

  await order.save();

  // Email user about status change
  try {
    await sendEmail({
      to:      order.user.email,
      subject: `Miskara — Order ${status} #${order._id.toString().slice(-8).toUpperCase()}`,
      html:    orderStatusTpl(order.user.name, order, status),
    });
  } catch (e) { console.error('Status email failed:', e.message); }

  res.json(order);
});