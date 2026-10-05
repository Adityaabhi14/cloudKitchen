# 🌶️ Vindu Ruchulu — Production Cloud Kitchen Platform

An artisanal, daily-batch cloud kitchen ordering web application specializing in authentic **Telangana and Andhra home-style feasts**.

Built on a next-day pre-order culinary philosophy:
> *"No frozen gravies. No microwaved curries. Our chef curates tomorrow's menu today, sources fresh poultry and stone-ground spices, and simmers your feast in traditional brass handis."*

---

## ✨ Features

### 1. Customer Experience
- **Editorial Design & Food-First Visuals**: High-resolution authentic food photography, crisp hierarchy, warm Telugu heritage palette (Guntur chilli red, warm turmeric, tamarind earth, raw silk cream). Zero glassmorphism.
- **Date-Driven Menu System**: Prominent Tomorrow / Today / Day After date switcher.
- **Clear Units & Pricing**: Independent portion units (`₹380 / 750 g`, `₹250 / 500 g`, `₹60 / 4 pcs`, `₹110 / 1 plate`).
- **Interactive Food Cards**: Spice levels (🌶️ 1 to 5), Pure Veg 🟢 / Non-Veg 🔴 badges, real-time stock counters (🟢 24 Fresh Portions, 🟠 Only 3 Left, 🔴 Sold Out), and smooth quantity steppers.
- **Slide-Over Cart & Sticky Mobile Bar**: Animated item modifiers, free delivery unlocked progress bar, promo discounts (`VINDU10`, `FIRSTFEAST`).
- **Frictionless Multi-Step Checkout**: Guest checkout with name, phone, address, meal time slot selection (Lunch 12:30-2:00 PM / Dinner 7:30-9:00 PM), and special cooking notes.
- **Razorpay Payment Gateway Architecture**: Server-side order generation and HMAC SHA-256 signature verification with built-in instant UPI/QR sandbox simulator.
- **Live Order Tracking**: Vertical progress timeline (Confirmed ➔ Simmering in Handis at Dawn ➔ Packed ➔ Out for Delivery ➔ Delivered) with lookup by Order ID (`#TEL-10482`) or phone number.

### 2. Kitchen Admin Dashboard (`/admin`)
- **Operations Overview**: Today's revenue & dispatches, Tomorrow's pre-orders & capacity, live kitchen workload, sold-out alerts, top-selling dishes.
- **Next-Day Menu Manager**: Select any calendar date, 1-Click "Duplicate Yesterday's Menu", 1-Click "Create Tomorrow's Menu", Publish/Unpublish toggle, inline stock adjusters (`+5` / `-5`), quick "Mark Sold Out" switch.
- **Master Food Catalog**: Full recipe editor with Telugu subtitles, customizable units (`g`, `kg`, `ml`, `litre`, `pcs`, `plate`, `box`, `serving`, `dozen`, `custom`), spice meters, and image links.
- **Live Orders Pipeline**: Filter by date or status, transition status in real-time, customer telephone direct call, and print KOT (Kitchen Order Ticket) bills.
- **Kitchen Settings**: Delivery charges, free delivery thresholds, packaging fees, operating time slots, and homepage notice broadcast.

---

## 🏛️ Architecture & Separation of Concerns

- **Frontend**: Next.js 14 App Router, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend Services**: API Route Controllers, HMAC signature validation, input validation, date-based menu orchestration.
- **Database**: Relational Database Engine (`database/db.ts`) with normalized tables, foreign keys, and immutable order item snapshots.
- **Documentation**: Detailed guides in [`docs/`](./docs/).

---

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm run dev
```

3. Access URLs:
- **Customer Storefront**: [http://localhost:3000](http://localhost:3000)
- **Live Order Tracker**: [http://localhost:3000/track-order](http://localhost:3000/track-order)
- **Kitchen Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin) *(User: `admin`, Pass: `admin123`)*

---

## 📜 Documentation
- [System Architecture](./docs/ARCHITECTURE.md)
- [REST API Specifications](./docs/API.md)
- [Database Schema & Constraints](./docs/DATABASE.md)
- [Setup & Environment Guide](./docs/SETUP.md)
