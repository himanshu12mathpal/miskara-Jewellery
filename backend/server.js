import express    from 'express';
import dotenv     from 'dotenv';
import cors       from 'cors';
import helmet     from 'helmet';
import rateLimit  from 'express-rate-limit';
import path       from 'path';
import { fileURLToPath } from 'url';
import connectDB  from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import authRoutes     from './routes/authRoutes.js';
import productRoutes  from './routes/productRoutes.js';
import orderRoutes    from './routes/orderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';

dotenv.config();

// Validate required env vars before starting
const REQUIRED_ENV = [
  'MONGO_URI','JWT_SECRET','CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET',
  'EMAIL_HOST','EMAIL_PORT','EMAIL_USER','EMAIL_PASS',
  'ADMIN_EMAIL','RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET',
  'FRONTEND_URL',
];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env variables:', missing.join(', '));
  process.exit(1);
}

connectDB();

const app  = express();
app.set("trust proxy", 1);
const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Security headers ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Body parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again after 15 minutes.' },
});
app.use('/api/', globalLimiter);

// Stricter limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/login',          authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password',  authLimiter);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: isProd ? 'production' : 'development', time: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reviews',  reviewRoutes);

// ── Serve React build in production ──
if (isProd) {
  const clientBuild = path.join(__dirname, '../frontend/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'Miskara API ✨ — dev mode' }));
}

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${isProd ? 'PRODUCTION' : 'development'} mode on port ${PORT}`);
});

// ── Unhandled rejections ──
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  if (isProd) process.exit(1);
});
