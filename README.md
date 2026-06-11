# 💎 Miskara Jewellery — MERN E-Commerce

A full-stack handmade jewellery e-commerce platform built with MongoDB, Express, React, and Node.js.

---

## 🗂️ Project Structure

```
nishkara-jewellery/
├── backend/          # Express + MongoDB API
└── frontend/         # React + Vite SPA
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** — copy `.env.example` → `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any random secret string |
| `CLOUDINARY_*` | Cloudinary account credentials |
| `EMAIL_*` | Gmail SMTP credentials |
| `RAZORPAY_*` | Razorpay key ID + secret |
| `FRONTEND_URL` | `http://localhost:5173` |

**Frontend** — copy `.env.example` → `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # runs on :5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # runs on :5173
```

---

## 🔑 Create Admin User

After registering a user via the app, update their role in MongoDB Atlas:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Or use MongoDB Compass to set `role: "admin"` on the user document.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Pure CSS with CSS variables |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Images | Cloudinary + Multer |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Private |
| PUT | `/api/auth/profile` | Private |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders/create-razorpay-order` | Private |
| POST | `/api/orders` | Private |
| GET | `/api/orders/myorders` | Private |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |

### Feedback
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/feedback` | Public |
| GET | `/api/feedback` | Admin |
| PUT | `/api/feedback/:id/read` | Admin |

---

## ✨ Features

- 🔐 JWT authentication with role-based access
- 🛍️ Product browsing with filters (category, gender, price, search)
- 🛒 Persistent cart with localStorage
- 💳 Razorpay payment gateway integration
- 📦 Order tracking with status updates
- 🔄 Automatic refunds when orders are rejected
- 📧 Email notifications (order accepted/rejected, feedback alerts)
- ☁️ Cloudinary image uploads
- 📱 Fully responsive UI

---

## 🎨 Design System

The UI uses a luxury dark-gold aesthetic:

- **Background:** Deep charcoal `#0e0b07`
- **Gold accent:** `#c9a96e`
- **Typography:** Cormorant Garamond (serif) + Jost (sans)
- **Theme:** Refined, editorial, luxury jewellery brand

---

## 🚀 Deployment

### Backend (Render / Railway)
1. Set all environment variables
2. Build command: `npm install`
3. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your deployed backend URL
2. Set `VITE_RAZORPAY_KEY_ID`
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 📂 Key Files

```
backend/
  server.js                    # Entry point
  controllers/orderController  # Order + auto-refund logic
  utils/sendEmail.js           # Nodemailer email utility
  utils/razorpay.js            # Razorpay instance

frontend/
  src/context/AuthContext.jsx  # Global auth state
  src/context/CartContext.jsx  # Global cart state
  src/pages/Cart.jsx           # Razorpay checkout flow
  src/pages/AdminDashboard.jsx # Full admin panel
```
