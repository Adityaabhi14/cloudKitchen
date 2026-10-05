# Vindu Cloud Kitchen — Setup & Run Guide

## Prerequisites
- Node.js v18+ (tested on Node.js v20 / v24)
- npm or yarn

---

## 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Example configuration in `.env.local`:
```env
PORT=3000
DATABASE_URL=file:./database/kitchen_relational_db.json
JWT_SECRET=super_secret_vindu_jwt_key_2026

# Optional: Real Razorpay credentials (if omitted, Sandbox Simulator runs seamlessly)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 2. Installation & Running
1. Install dependencies:
```bash
npm install
```

2. Start the local server:
```bash
npm run dev
```

3. Open in your browser:
- **Customer Food Website**: [http://localhost:3000](http://localhost:3000)
- **Live Order Tracker**: [http://localhost:3000/track-order](http://localhost:3000/track-order)
- **Kitchen Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) (Demo Credentials: `admin` / `admin123`)

---

## 3. Production Build
```bash
npm run build
npm run start
```
