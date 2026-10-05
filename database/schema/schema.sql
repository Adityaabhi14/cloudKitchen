-- =============================================================================
-- VINDU CLOUD KITCHEN - RELATIONAL DATABASE SCHEMA (SQLite / PostgreSQL compatible)
-- Focus: Authentic Telangana & Andhra Next-Day Daily Batch Cloud Kitchen
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    telugu_name TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. FOOD ITEMS (MASTER RECIPE & DISH CATALOG)
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    telugu_name TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_price REAL NOT NULL,
    default_unit TEXT NOT NULL, -- '500 g', '750 g', '1 kg', '1 plate', '4 pcs', etc.
    category_id TEXT NOT NULL,
    is_veg INTEGER NOT NULL DEFAULT 0, -- 1: Veg, 0: Non-Veg
    spice_level INTEGER NOT NULL DEFAULT 3, -- 1 (Mild) to 5 (Telangana Fire)
    image_url TEXT NOT NULL,
    default_stock INTEGER NOT NULL DEFAULT 20,
    max_order_qty INTEGER NOT NULL DEFAULT 5,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 3. MENUS (DATE-BASED DAILY MENUS)
CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    menu_date TEXT NOT NULL UNIQUE, -- 'YYYY-MM-DD' e.g. '2026-10-06'
    title TEXT NOT NULL,
    note TEXT,
    is_published INTEGER NOT NULL DEFAULT 1, -- 1: Visible to customers, 0: Draft
    is_accepting_orders INTEGER NOT NULL DEFAULT 1,
    cutoff_time TEXT DEFAULT '23:00', -- 11:00 PM
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. MENU ITEMS (ITEMS AVAILABLE FOR A SPECIFIC MENU DATE)
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    menu_id TEXT NOT NULL,
    food_item_id TEXT NOT NULL,
    price_override REAL, -- Nullable, defaults to food_items.base_price
    unit_override TEXT,  -- Nullable, defaults to food_items.default_unit
    available_quantity INTEGER NOT NULL DEFAULT 20,
    remaining_stock INTEGER NOT NULL DEFAULT 20,
    max_order_qty INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'LOW_STOCK', 'SOLD_OUT', 'HIDDEN'
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    UNIQUE(menu_id, food_item_id)
);

-- 5. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    pincode TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Hyderabad',
    is_default INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 7. ORDERS TABLE (IMMUTABLE PURCHASE RECORD)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE, -- 'TEL-10482'
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address_line TEXT NOT NULL,
    delivery_landmark TEXT,
    delivery_pincode TEXT NOT NULL,
    delivery_city TEXT NOT NULL DEFAULT 'Hyderabad',
    delivery_slot TEXT NOT NULL, -- 'Lunch (12:30 PM - 2:00 PM)' or 'Dinner (7:30 PM - 9:00 PM)'
    cooking_instructions TEXT,
    menu_date TEXT NOT NULL, -- Target consumption date: 'YYYY-MM-DD'
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 0,
    packaging_fee REAL NOT NULL DEFAULT 20,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'UPI', 'CARD', 'NETBANKING', 'RAZORPAY', 'COD'
    payment_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    order_status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- 8. ORDER ITEMS TABLE (PRESERVES EXACT SNAPSHOT OF PRICE & UNIT AT PURCHASE TIME)
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    food_item_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    telugu_name TEXT,
    price_at_purchase REAL NOT NULL,
    unit_at_purchase TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    item_total REAL NOT NULL,
    image_url TEXT NOT NULL,
    is_veg INTEGER NOT NULL,
    spice_level INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

-- 9. ORDER STATUS HISTORY (AUDIT & TRACKING TIMELINE)
CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    updated_by TEXT DEFAULT 'System',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 10. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'superadmin', 'manager', 'chef'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. KITCHEN SETTINGS TABLE (SINGLETON ROW)
CREATE TABLE IF NOT EXISTS kitchen_settings (
    id TEXT PRIMARY KEY,
    kitchen_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT '₹',
    delivery_fee REAL NOT NULL DEFAULT 40,
    free_delivery_threshold REAL NOT NULL DEFAULT 600,
    packaging_fee REAL NOT NULL DEFAULT 20,
    tax_rate REAL NOT NULL DEFAULT 0.05,
    delivery_slots TEXT NOT NULL, -- JSON array of strings
    is_kitchen_open INTEGER NOT NULL DEFAULT 1,
    ordering_notice TEXT NOT NULL,
    allow_guest_checkout INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_orders_menu_date ON orders(menu_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
