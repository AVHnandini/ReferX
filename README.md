# 🚀 ReferX — Alumni Job Referral Platform

A full-stack platform connecting students with alumni for job referrals.

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + OTP |
| Realtime | Socket.io |
| Charts | Recharts |

---

## 🗂️ Project Structure

```
referx/
├── frontend/         # React app (Vite)
│   └── src/
│       ├── pages/    # auth/, student/, alumni/, admin/
│       ├── components/layout/
│       ├── context/  # AuthContext
│       └── services/ # API service layer
├── backend/          # Express API
│   ├── controllers/  # Business logic
│   ├── routes/       # Route definitions
│   ├── middleware/   # JWT auth
│   └── config/       # Supabase client
└── database/         # supabase-schema.sql
```

---

## ⚡ Quick Start

### 1. Setup Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste `database/supabase-schema.sql` → Run

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase URL and keys in .env
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
# Create .env with: VITE_API_URL=http://localhost:5000
npm run dev
```

---

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
JWT_SECRET=your_super_secret_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | Browse jobs, request referrals, chat, profile |
| **Alumni** | Post jobs, manage referrals, chat, mentor |
| **Admin** | Verify alumni, manage users, view stats |

---

## 🔐 Default Admin

```
Email:    admin@referx.com
Password: admin123
```

---

## 📡 API Routes

```
POST   /auth/signup            Register user
POST   /auth/verify-otp        Verify OTP (any 6-digit works in dev)
POST   /auth/login             Login

GET    /users/profile          My profile
PUT    /users/profile          Update profile

POST   /jobs/create            Post job (alumni)
GET    /jobs/all               List jobs
GET    /jobs/recommend         Personalized jobs (student)

POST   /referrals/request      Request referral (student)
PUT    /referrals/respond/:id  Accept/reject referral (alumni)
GET    /referrals/status       My referrals

POST   /chat/send              Send message
GET    /chat/messages/:userId  Chat history
GET    /chat/conversations     All conversations

GET    /admin/stats            Platform stats
GET    /admin/alumni           All alumni
PUT    /admin/alumni/:id/verify Verify alumni

POST   /resume/analyze         Analyze resume text
```

---

## ✨ Features

- 🎓 College email validation for students
- ✅ Alumni verification workflow
- 💼 Job posting & smart skill-based matching
- 📨 Referral request system with status tracking
- 💬 Real-time chat (Socket.io)
- 📊 Admin analytics dashboard (Recharts)
- 🔍 Resume analyzer with skill extraction
- 🌙 Premium dark UI (glassmorphism + gradients)
- 📱 Fully responsive mobile design
