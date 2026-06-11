import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const { category, gender, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;

  const query = { isAvailable: true };

  if (category) query.category = category;
  if (gender) query.gender = gender;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) query.$text = { $search: search };

  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };

  const sortBy = sortOptions[sort] || { createdAt: -1 };
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, gender, stock, material, tags } = req.body;

  const images = req.files
    ? req.files.map((f) => ({ url: f.path, public_id: f.filename }))
    : [];

  const product = await Product.create({
    name,
    description,
    price,
    category,
    gender,
    stock,
    material,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    images,
  });

  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, description, price, category, gender, stock, material, tags, isAvailable } =
    req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.gender = gender || product.gender;
  product.stock = stock !== undefined ? stock : product.stock;
  product.material = material || product.material;
  product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
  if (tags) product.tags = tags.split(',').map((t) => t.trim());

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    product.images = [...product.images, ...newImages];
  }

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted successfully' });
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/image/:publicId
// @access  Admin
export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const publicId = decodeURIComponent(req.params.publicId);
  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.json({ message: 'Image deleted' });
});

// @desc    Get top selling products by actual order count
// @route   GET /api/products/top-sellers
// @access  Public
export const getTopSellers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;

  // Aggregate from Orders — count how many times each product was ordered
  // Only count Accepted, Shipped, Delivered orders (not Pending/Rejected)
  const Order = (await import('../models/Order.js')).default;

  const topProductIds = await Order.aggregate([
    // Only count successful orders
    { $match: { status: { $in: ['Accepted', 'Shipped', 'Delivered', 'Pending'] } } },
    // Unwind order items array
    { $unwind: '$orderItems' },
    // Group by product, sum quantities
    {
      $group: {
        _id:           '$orderItems.product',
        totalSold:     { $sum: '$orderItems.quantity' },
        totalOrders:   { $sum: 1 },
        totalRevenue:  { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    // Sort by totalSold descending
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

  if (topProductIds.length === 0) {
    // No orders yet — fallback to newest products
    const products = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.json(products.map(p => ({ ...p.toObject(), totalSold: 0, totalOrders: 0 })));
  }

  // Fetch full product details and attach sales data
  const productMap = {};
  topProductIds.forEach(item => {
    productMap[item._id.toString()] = {
      totalSold:    item.totalSold,
      totalOrders:  item.totalOrders,
      totalRevenue: item.totalRevenue,
    };
  });

  const productIds = topProductIds.map(item => item._id);
  const products   = await Product.find({ _id: { $in: productIds }, isAvailable: true });

  // Sort products in same order as aggregation result
  const sorted = productIds
    .map(id => products.find(p => p._id.toString() === id.toString()))
    .filter(Boolean)
    .map(p => ({
      ...p.toObject(),
      totalSold:    productMap[p._id.toString()]?.totalSold    || 0,
      totalOrders:  productMap[p._id.toString()]?.totalOrders  || 0,
      totalRevenue: productMap[p._id.toString()]?.totalRevenue || 0,
    }));

  res.json(sorted);
});