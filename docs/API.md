# Vindu Cloud Kitchen — API Specification

Base URL: `/api`

All responses follow the standard JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable feedback",
  "error": "Error description if success is false"
}
```

---

## 1. Menu Endpoints

### `GET /api/menu`
Fetches the published menu for a target date.
- **Query Params**:
  - `date` (string, optional, format: `YYYY-MM-DD`): Target dining date. Defaults to tomorrow's date.
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "menu-2026-10-06",
    "menu_date": "2026-10-06",
    "title": "Tomorrow's Grand Feast",
    "note": "Slow-cooked in brass handis with stone-ground masalas.",
    "is_published": 1,
    "is_accepting_orders": 1,
    "cutoff_time": "23:00",
    "items": [
      {
        "id": "mi-2026-10-06-food-1",
        "menu_id": "menu-2026-10-06",
        "food_item_id": "food-1",
        "available_quantity": 30,
        "remaining_stock": 24,
        "max_order_qty": 4,
        "status": "AVAILABLE",
        "food": {
          "id": "food-1",
          "name": "Nawabi Hyderabadi Mutton Dum Biryani",
          "telugu_name": "హైదరాబాదీ మటన్ దమ్ బిర్యానీ",
          "description": "Layered aged basmati rice with tender marinated mutton chunks...",
          "base_price": 380,
          "default_unit": "750 g",
          "category_id": "cat-biryani",
          "is_veg": 0,
          "spice_level": 4,
          "image_url": "https://..."
        }
      }
    ]
  }
}
```

### `POST /api/menu`
Admin updates menu settings, titles, publish status, or overrides item availability for a date.
- **Payload**:
```json
{
  "date": "2026-10-06",
  "title": "Tomorrow's Grand Feast",
  "isPublished": true,
  "isAcceptingOrders": true,
  "cutoffTime": "23:00",
  "items": [
    {
      "foodItemId": "food-1",
      "availableQuantity": 35,
      "remainingStock": 35,
      "status": "AVAILABLE"
    }
  ]
}
```

### `POST /api/menu/duplicate`
Duplicates all dishes and portions from a source date to a target date.
- **Payload**:
```json
{
  "sourceDate": "2026-10-05",
  "targetDate": "2026-10-06"
}
```

---

## 2. Food Catalog Endpoints

### `GET /api/items`
Returns all master dishes in the kitchen catalog.

### `POST /api/items`
Adds a new dish to the master catalog.
- **Payload**:
```json
{
  "name": "Nellore Chepala Pulusu",
  "teluguName": "నెల్లూరు చేపల పులుసు",
  "description": "Murrel fish in claypot tamarind curry",
  "price": 290,
  "unit": "400 g",
  "category": "Curries",
  "isVeg": false,
  "spiceLevel": 4,
  "imageUrl": "https://...",
  "availableQuantity": 20,
  "maxOrderQty": 3,
  "status": "AVAILABLE"
}
```

### `PUT /api/items/:id`
Updates dish recipe, price, unit, or spice level.

### `DELETE /api/items/:id`
Removes dish from master catalog.

---

## 3. Order Endpoints

### `POST /api/orders`
Creates a customer pre-order, deducts stock, and logs initial audit history.
- **Payload**:
```json
{
  "customer": {
    "name": "Rahul Varma",
    "phone": "9876543210",
    "email": "rahul.varma@gmail.com"
  },
  "deliveryAddress": {
    "addressLine1": "Flat 402, Sai Krupa Towers",
    "landmark": "Opp City Center Mall",
    "pincode": "500034",
    "city": "Hyderabad",
    "deliverySlot": "Lunch (12:30 PM - 2:00 PM)",
    "cookingInstructions": "Extra salan please"
  },
  "items": [
    {
      "foodItemId": "food-1",
      "quantity": 2
    }
  ],
  "subtotal": 760,
  "deliveryFee": 0,
  "packagingFee": 20,
  "discount": 0,
  "total": 780,
  "menuDate": "2026-10-06",
  "paymentMethod": "UPI",
  "paymentStatus": "PAID",
  "razorpayOrderId": "order_mok_123",
  "razorpayPaymentId": "pay_mok_456"
}
```

### `GET /api/orders`
Admin orders list with optional filters:
- `?date=2026-10-06`
- `?status=PREPARING`
- `?phone=9876543210`

### `GET /api/orders/:id`
Returns single order details by Order ID or Order Reference (e.g. `TEL-10482`).

### `PATCH /api/orders/:id`
Admin transitions order status: `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` / `CANCELLED`.

---

## 4. Payment Endpoints

### `POST /api/payment/create-order`
Initializes a server-side payment order.
- **Payload**: `{ "amount": 780, "currency": "INR" }`

### `POST /api/payment/verify`
Performs cryptographic HMAC SHA-256 signature verification.
- **Payload**:
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_hash"
}
```

---

## 5. Auth & Admin Endpoints

### `POST /api/auth/login`
- **Payload**: `{ "username": "admin", "password": "admin123" }`

### `GET /api/admin/stats`
Returns overview analytics (today & tomorrow revenues, preparing count, sold out count, top dishes).
