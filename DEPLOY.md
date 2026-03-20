# 🚀 Miskara Jewellery — Production Deployment Guide

## 📋 Pre-deployment Checklist

### Backend Environment Variables (Set ALL of these)
| Variable | Where to get |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Random 32+ char string |
| `CLOUDINARY_*` | cloudinary.com → Dashboard |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail **App Password** (not regular password) |
| `ADMIN_EMAIL` | Email where order alerts go |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `FRONTEND_URL` | Your frontend domain (e.g. `https://miskara.vercel.app`) |
| `PORT` | Usually set by platform automatically |

### Frontend Environment Variables
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay LIVE key_id |

---

## 🛠️ Gmail App Password Setup (REQUIRED for emails)
1. Go to **myaccount.google.com**
2. Security → **2-Step Verification** → Enable it
3. Security → **App Passwords**
4. Select app: **Mail**, device: **Other** → type "Miskara"
5. Copy the 16-character password → use as `EMAIL_PASS`

---

## 🌐 Option A: Render (Backend) + Vercel (Frontend)

### Backend on Render
1. Push code to GitHub
2. Go to **render.com** → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root directory**: `nishkara-jewellery/backend`  (or `backend` if separate repo)
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Node version**: 18+
5. Add all environment variables in Render dashboard
6. Deploy!

### Frontend on Vercel
1. Go to **vercel.com** → New Project
2. Import GitHub repo
3. Settings:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your live key
5. Deploy!
6. Copy Vercel URL → Update `FRONTEND_URL` in Render env vars → Redeploy backend

---

## 🌐 Option B: Railway (Full stack on one platform)

1. Create account at **railway.app**
2. New project → Deploy from GitHub
3. Add both `backend` and `frontend` as separate services
4. Set all env variables per service

---

## 🌐 Option C: Single VPS (e.g. DigitalOcean / Linode)

```bash
# 1. Clone repo
git clone your-repo && cd nishkara-jewellery

# 2. Backend setup
cd backend
cp .env.example .env
nano .env  # Fill all values
npm install
npm start  # Or use PM2:

# 3. Use PM2 for process management
npm install -g pm2
pm2 start server.js --name miskara-api
pm2 startup   # Auto-restart on reboot
pm2 save

# 4. Frontend build
cd ../frontend
cp .env.example .env
nano .env  # Set VITE_API_URL
npm install
npm run build
# Serve dist/ with Nginx

# 5. Nginx config (reverse proxy)
# /etc/nginx/sites-available/miskara
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ✅ Post-Deployment Verification

1. **Health check**: `GET https://your-backend.com/api/health` → should return `{"status":"ok"}`
2. **CORS**: Open browser console on frontend — no CORS errors
3. **Register**: Create account → Check if verification email arrives
4. **Login**: Should work without OTP
5. **Forgot password**: Check if reset email arrives
6. **Add product** (admin): Test Cloudinary image upload
7. **Place order**: Test Razorpay payment → Check emails (user + admin)
8. **Admin actions**: Accept/reject order → Check user email

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Email not sending | Check `EMAIL_PASS` is App Password, not Gmail password |
| CORS error | Add frontend URL to `FRONTEND_URL` env var |
| MongoDB connection failed | Whitelist `0.0.0.0/0` in Atlas Network Access |
| Razorpay payment failed | Switch from test keys to live keys |
| Images not uploading | Verify all 3 Cloudinary env vars |
| JWT errors | Make sure `JWT_SECRET` is same across all instances |

---

## 📧 Email Checklist
- [ ] Gmail 2FA enabled
- [ ] App Password generated (16 chars, no spaces)
- [ ] `EMAIL_USER` = exact Gmail address
- [ ] `EMAIL_PASS` = 16-char App Password
- [ ] `ADMIN_EMAIL` = where you want order alerts
- [ ] Test by registering a new user (verify email should arrive)
