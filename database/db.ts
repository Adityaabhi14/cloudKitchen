import fs from 'fs';
import path from 'path';

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  telugu_name?: string;
  description?: string;
  sort_order: number;
  is_active: number;
}

export interface FoodItemRecord {
  id: string;
  name: string;
  telugu_name?: string;
  slug: string;
  description: string;
  telugu_description?: string;
  base_price: number;
  default_unit: string;
  category_id: string;
  category_name?: string;
  is_veg: number;
  spice_level: number;
  image_url: string;
  default_stock: number;
  max_order_qty: number;
  min_order_qty?: number;
  prep_time_minutes?: number;
  ingredients?: string[];
  allergens?: string[];
  cooking_notes?: string;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface MenuRecord {
  id: string;
  menu_date: string;
  title: string;
  note?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  is_published: number;
  is_accepting_orders: number;
  cutoff_time: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemRecord {
  id: string;
  menu_id: string;
  food_item_id: string;
  price_override?: number;
  unit_override?: string;
  available_quantity: number;
  remaining_stock: number;
  max_order_qty: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT' | 'HIDDEN';
  sort_order: number;
  meal_slot?: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER' | 'ALL_DAY';
  food?: FoodItemRecord;
}

export interface CustomerAddressRecord {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone: string;
  house_flat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
  is_default: boolean;
}

export interface CustomerRecord {
  id: string;
  google_id?: string;
  name: string;
  phone: string;
  email?: string;
  profile_image?: string;
  status: 'ACTIVE' | 'BLOCKED';
  notes?: string;
  addresses?: CustomerAddressRecord[];
  saved_addresses?: {
    id: string;
    address_line: string;
    landmark?: string;
    pincode: string;
    city: string;
    is_default: boolean;
  }[];
  favorites?: string[]; // food_item_ids
  notifications_enabled?: boolean;
  marketing_enabled?: boolean;
  is_deleted?: number; // 1 for soft-deleted / anonymized
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface DeliveryZoneRecord {
  id: string;
  name: string;
  pincodes: string[];
  delivery_fee: number;
  min_order: number;
  max_distance_km?: number;
  is_active: number;
}

export interface DeliverySlotRecord {
  id: string;
  name: string;
  time_range: string;
  cutoff_time?: string;
  max_orders: number;
  current_orders: number;
  is_active: number;
}

export interface NotificationRecord {
  id: string;
  customer_id: string; // customer id, or 'ALL', or 'ADMIN'
  title: string;
  message: string;
  type: 'ORDER' | 'KITCHEN' | 'MENU' | 'PROMO' | 'SYSTEM';
  link?: string;
  read: number;
  created_at: string;
}


export interface OrderItemRecord {
  id: string;
  order_id: string;
  food_item_id: string;
  food_name: string;
  telugu_name?: string;
  price_at_purchase: number;
  unit_at_purchase: string;
  quantity: number;
  item_total: number;
  image_url: string;
  is_veg: number;
  spice_level: number;
}

export interface OrderStatusHistoryRecord {
  id: string;
  order_id: string;
  status: string;
  note?: string;
  updated_by: string;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address_line: string;
  delivery_landmark?: string;
  delivery_pincode: string;
  delivery_city: string;
  delivery_slot: string;
  cooking_instructions?: string;
  menu_date: string;
  subtotal: number;
  delivery_fee: number;
  packaging_fee: number;
  discount: number;
  tax?: number;
  total: number;
  payment_method: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  order_status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
  delivery_status?: 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  assigned_rider_name?: string;
  assigned_rider_phone?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItemRecord[];
  history?: OrderStatusHistoryRecord[];
}

export interface KitchenSettingsRecord {
  id: string;
  kitchen_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  packaging_fee: number;
  tax_rate: number;
  delivery_slots: string[];
  is_kitchen_open: number;
  ordering_notice: string;
  allow_guest_checkout: number;
  operating_hours?: string;
  ordering_cutoff?: string;
  social_links?: {
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
    youtube?: string;
  };
  updated_at: string;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'KITCHEN_MANAGER' | 'ORDER_MANAGER' | 'INVENTORY_MANAGER' | 'DELIVERY_MANAGER' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  custom_permissions?: string[];
  created_at: string;
  last_login?: string;
}

export interface AuditLogRecord {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface ReviewRecord {
  id: string;
  order_id?: string;
  customer_name: string;
  dish_name?: string;
  rating: number;
  comment: string;
  reply?: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN' | 'FLAGGED';
  created_at: string;
}

export interface PromotionRecord {
  id: string;
  code: string;
  description: string;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  usage_limit: number;
  times_used: number;
  is_active: number;
  valid_until: string;
  created_at: string;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'dashboard:view', 'orders:view', 'orders:edit', 'orders:cancel',
    'menu:view', 'menu:edit', 'menu:create', 'menu:publish',
    'food_items:view', 'food_items:edit', 'categories:view', 'categories:edit',
    'inventory:view', 'inventory:edit',
    'customers:view', 'customers:edit',
    'payments:view', 'payments:refund',
    'delivery:view', 'delivery:edit',
    'analytics:view', 'reviews:view', 'reviews:reply',
    'promotions:view', 'promotions:edit',
    'settings:view', 'settings:edit',
    'users:view', 'audit_logs:view'
  ],
  KITCHEN_MANAGER: [
    'dashboard:view', 'menu:view', 'menu:edit', 'menu:create', 'menu:publish',
    'food_items:view', 'food_items:edit', 'categories:view',
    'inventory:view', 'inventory:edit',
    'orders:view', 'orders:update_prep'
  ],
  ORDER_MANAGER: [
    'dashboard:view', 'orders:view', 'orders:edit', 'orders:cancel',
    'customers:view_basic', 'delivery:view'
  ],
  INVENTORY_MANAGER: [
    'dashboard:view', 'inventory:view', 'inventory:edit',
    'food_items:view', 'menu:view'
  ],
  DELIVERY_MANAGER: [
    'dashboard:view', 'delivery:view', 'delivery:edit', 'delivery:assign',
    'orders:view_delivery'
  ],
  SUPPORT: [
    'dashboard:view', 'orders:view', 'customers:view_basic',
    'reviews:view', 'reviews:reply'
  ]
};

interface RelationalDatabaseData {
  categories: CategoryRecord[];
  food_items: FoodItemRecord[];
  menus: MenuRecord[];
  menu_items: MenuItemRecord[];
  customers: CustomerRecord[];
  orders: OrderRecord[];
  order_items: OrderItemRecord[];
  order_status_history: OrderStatusHistoryRecord[];
  admins: AdminUserRecord[];
  kitchen_settings: KitchenSettingsRecord;
  units: string[];
  audit_logs: AuditLogRecord[];
  reviews: ReviewRecord[];
  promotions: PromotionRecord[];
  delivery_zones: DeliveryZoneRecord[];
  notifications: NotificationRecord[];
}

const DB_PATH = path.join(process.cwd(), 'database', 'kitchen_relational_db.json');

class RelationalDatabase {
  private data: RelationalDatabaseData;

  constructor() {
    this.data = this.initialize();
  }

  private initialize(): RelationalDatabaseData {
    try {
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all arrays exist even if expanding older db files
        if (!parsed.audit_logs) parsed.audit_logs = [];
        if (!parsed.reviews) parsed.reviews = [];
        if (!parsed.promotions) parsed.promotions = [];
        if (!parsed.delivery_zones || parsed.delivery_zones.length === 0) parsed.delivery_zones = this.getSeedDeliveryZones();
        if (!parsed.notifications || parsed.notifications.length === 0) parsed.notifications = this.getSeedNotifications();
        if (!parsed.admins || parsed.admins.length === 0 || !parsed.admins[0].role.includes('_')) {
          parsed.admins = this.getSeedAdmins();
        }
        if (parsed.reviews.length === 0) parsed.reviews = this.getSeedReviews();
        if (parsed.promotions.length === 0) parsed.promotions = this.getSeedPromotions();
        return parsed;
      }
    } catch (e) {
      console.error('Error loading relational database:', e);
    }

    const initial = this.getSeedData();
    this.save(initial);
    return initial;
  }


  private save(dataToSave: RelationalDatabaseData = this.data) {
    try {
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save relational database:', e);
    }
  }

  private getSeedAdmins(): AdminUserRecord[] {
    return [
      {
        id: 'adm-super',
        username: 'admin',
        email: 'admin@vinduruchulu.com',
        phone: '9876543210',
        password_hash: 'admin123',
        name: 'Sita Rama Varma',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        custom_permissions: ['*'],
        created_at: '2026-01-01T00:00:00.000Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'adm-chef',
        username: 'chef.ravi',
        email: 'ravi@vinduruchulu.com',
        phone: '9876543211',
        password_hash: 'chef123',
        name: 'Chef Ravi Teja (Master Chef)',
        role: 'KITCHEN_MANAGER',
        status: 'ACTIVE',
        created_at: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'adm-orders',
        username: 'orders.anjali',
        email: 'anjali@vinduruchulu.com',
        phone: '9876543212',
        password_hash: 'orders123',
        name: 'Anjali Reddy (Operations Lead)',
        role: 'ORDER_MANAGER',
        status: 'ACTIVE',
        created_at: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'adm-inventory',
        username: 'inventory.kiran',
        email: 'kiran@vinduruchulu.com',
        phone: '9876543213',
        password_hash: 'inv123',
        name: 'Kiran Kumar (Stores Incharge)',
        role: 'INVENTORY_MANAGER',
        status: 'ACTIVE',
        created_at: '2026-01-20T00:00:00.000Z',
      },
      {
        id: 'adm-delivery',
        username: 'delivery.suresh',
        email: 'suresh@vinduruchulu.com',
        phone: '9876543214',
        password_hash: 'del123',
        name: 'Suresh Goud (Fleet Manager)',
        role: 'DELIVERY_MANAGER',
        status: 'ACTIVE',
        created_at: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 'adm-support',
        username: 'support.priya',
        email: 'priya@vinduruchulu.com',
        phone: '9876543215',
        password_hash: 'help123',
        name: 'Priya Rao (Customer Care)',
        role: 'SUPPORT',
        status: 'ACTIVE',
        created_at: '2026-02-15T00:00:00.000Z',
      },
    ];
  }

  private getSeedReviews(): ReviewRecord[] {
    return [
      {
        id: 'rev-1',
        order_id: 'ord-10480',
        customer_name: 'Dr. K. Prabhakar',
        dish_name: 'Nawabi Hyderabadi Mutton Dum Biryani',
        rating: 5,
        comment: 'Pure authentic flavor! Reminds me of traditional old-city wedding feasts. Meat was melt-in-mouth tender and the aroma of saffron on dum was outstanding.',
        reply: 'Dhanyavadalu Dr. Prabhakar garu! We slow-cook our mutton biryani over wood embers using aged Seeraga/Basmati rice.',
        status: 'APPROVED',
        created_at: '2026-10-04T18:30:00.000Z',
      },
      {
        id: 'rev-2',
        order_id: 'ord-10481',
        customer_name: 'Sunitha Reddy',
        dish_name: 'Gongura Mamsam (Mutton)',
        rating: 5,
        comment: 'The Gongura mutton had that quintessential sour-spicy punch from freshly plucked sorrel leaves. Goes perfectly with steamed rice and ghee.',
        status: 'APPROVED',
        created_at: '2026-10-04T19:15:00.000Z',
      },
      {
        id: 'rev-3',
        order_id: 'ord-10482',
        customer_name: 'Harish Rao',
        dish_name: 'Telangana Natu Kodi Pulusu',
        rating: 5,
        comment: 'The country chicken gravy had the exact Warangal village taste. Country chicken cooked to perfection with rustic whole spices.',
        status: 'APPROVED',
        created_at: '2026-10-05T12:00:00.000Z',
      },
      {
        id: 'rev-4',
        order_id: 'ord-10483',
        customer_name: 'Venkat Varma',
        dish_name: 'Palakollu Prawns Iguru',
        rating: 4,
        comment: 'Godavari style prawns with fresh coconut and poppy seed paste. Truly mouth-watering.',
        reply: 'Thank you Venkat garu! We source fresh Godavari water prawns daily.',
        status: 'APPROVED',
        created_at: '2026-10-05T13:20:00.000Z',
      },
      {
        id: 'rev-5',
        order_id: 'ord-10484',
        customer_name: 'Shailaja Devi',
        dish_name: 'Gutti Vankaya Kura',
        rating: 5,
        comment: 'Best Gutti Vankaya in Hyderabad! The sesame, peanut, and coriander seed stuffing inside small purple brinjals was heavenly.',
        status: 'APPROVED',
        created_at: '2026-10-05T14:40:00.000Z',
      },
    ];
  }

  private getSeedPromotions(): PromotionRecord[] {
    return [
      {
        id: 'promo-1',
        code: 'VINDU10',
        description: '10% Instant Discount on Next-Day Feast Pre-orders',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        min_order_value: 399,
        max_discount: 100,
        usage_limit: 1000,
        times_used: 48,
        is_active: 1,
        valid_until: '2026-12-31T23:59:59.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'promo-2',
        code: 'FIRSTFEAST',
        description: '15% Welcome Discount for First-Time Customers',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        min_order_value: 499,
        max_discount: 150,
        usage_limit: 500,
        times_used: 24,
        is_active: 1,
        valid_until: '2026-12-31T23:59:59.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'promo-3',
        code: 'WARANGAL20',
        description: '₹120 Flat Festive Discount on Royal Telangana Feasts above ₹799',
        discount_type: 'FLAT',
        discount_value: 120,
        min_order_value: 799,
        max_discount: 120,
        usage_limit: 200,
        times_used: 12,
        is_active: 1,
        valid_until: '2026-11-30T23:59:59.000Z',
        created_at: '2026-09-01T00:00:00.000Z',
      },
    ];
  }

  private getSeedDeliveryZones(): DeliveryZoneRecord[] {
    return [
      {
        id: 'zone-jubilee',
        name: 'Jubilee Hills & Film Nagar',
        pincodes: ['500033', '500096'],
        delivery_fee: 40,
        min_order: 299,
        max_distance_km: 8,
        is_active: 1,
      },
      {
        id: 'zone-banjara',
        name: 'Banjara Hills & Somajiguda',
        pincodes: ['500034', '500082', '500016'],
        delivery_fee: 40,
        min_order: 299,
        max_distance_km: 10,
        is_active: 1,
      },
      {
        id: 'zone-madhapur',
        name: 'Madhapur & HITEC City',
        pincodes: ['500081', '500085'],
        delivery_fee: 45,
        min_order: 349,
        max_distance_km: 12,
        is_active: 1,
      },
      {
        id: 'zone-gachibowli',
        name: 'Gachibowli & Financial District',
        pincodes: ['500032', '500075', '500089'],
        delivery_fee: 50,
        min_order: 399,
        max_distance_km: 15,
        is_active: 1,
      },
      {
        id: 'zone-kondapur',
        name: 'Kondapur & Botanical Garden',
        pincodes: ['500084'],
        delivery_fee: 45,
        min_order: 349,
        max_distance_km: 12,
        is_active: 1,
      },
      {
        id: 'zone-kukatpally',
        name: 'Kukatpally, KPHB & Miyapur',
        pincodes: ['500072', '500049'],
        delivery_fee: 55,
        min_order: 399,
        max_distance_km: 18,
        is_active: 1,
      },
      {
        id: 'zone-secunderabad',
        name: 'Secunderabad & Begumpet',
        pincodes: ['500003', '500011', '500015'],
        delivery_fee: 60,
        min_order: 499,
        max_distance_km: 22,
        is_active: 1,
      },
    ];
  }

  private getSeedNotifications(): NotificationRecord[] {
    return [
      {
        id: 'notif-1',
        customer_id: 'ALL',
        title: 'Welcome to Vindu Ruchulu!',
        message: 'Pre-order authentic Telangana & Andhra home-style culinary feasts cooked fresh every morning in traditional brass handis.',
        type: 'SYSTEM',
        link: '/#menu-section',
        read: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        customer_id: 'ALL',
        title: 'Chef Special Announcement',
        message: 'Fresh batch of Gongura Mamsam & Nawabi Mutton Dum Biryani is available for tomorrow dinner slots.',
        type: 'MENU',
        link: '/#menu-section',
        read: 0,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getSeedData(): RelationalDatabaseData {
    const categories: CategoryRecord[] = [
      { id: 'cat-biryani', name: 'Biryani & Pulao', slug: 'biryani', telugu_name: 'బిర్యానీ & పులావ్', sort_order: 1, is_active: 1 },
      { id: 'cat-curries', name: 'Curries & Pulusu', slug: 'curries', telugu_name: 'కూరలు & పులుసులు', sort_order: 2, is_active: 1 },
      { id: 'cat-meals', name: 'Full Meals & Combos', slug: 'meals', telugu_name: 'సంపూర్ణ భోజనం', sort_order: 3, is_active: 1 },
      { id: 'cat-tiffins', name: 'Tiffins & Breakfast', slug: 'tiffins', telugu_name: 'టిఫిన్లు & అల్పాహారం', sort_order: 4, is_active: 1 },
      { id: 'cat-snacks', name: 'Snacks & Starters', slug: 'snacks', telugu_name: 'స్నాక్స్ & వేపుళ్లు', sort_order: 5, is_active: 1 },
      { id: 'cat-rice', name: 'Flavoured Rice', slug: 'rice', telugu_name: 'అన్నం & పులిహోర', sort_order: 6, is_active: 1 },
      { id: 'cat-pachadi', name: 'Pachadi & Podi', slug: 'pachadi', telugu_name: 'పచ్చళ్లు & కారప్పొడులు', sort_order: 7, is_active: 1 },
      { id: 'cat-desserts', name: 'Sweets & Desserts', slug: 'desserts', telugu_name: 'మిఠాయిలు', sort_order: 8, is_active: 1 },
      { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', telugu_name: 'పానీయాలు', sort_order: 9, is_active: 1 },
    ];

    const food_items: FoodItemRecord[] = [
      {
        id: 'food-1',
        name: 'Nawabi Hyderabadi Mutton Dum Biryani',
        telugu_name: 'హైదరాబాదీ మటన్ దమ్ బిర్యానీ',
        slug: 'hyderabadi-mutton-dum-biryani',
        description: 'Layered aged basmati rice with tender marinated mutton chunks, saffron milk, fried onions, and cooked over wood embers on dum.',
        base_price: 380,
        default_unit: '750 g',
        category_id: 'cat-biryani',
        is_veg: 0,
        spice_level: 4,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
        default_stock: 25,
        max_order_qty: 5,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-2',
        name: 'Bhimavaram Royyala (Prawns) Biryani',
        telugu_name: 'భీమవరం రొయ్యల బిర్యానీ',
        slug: 'bhimavaram-royyala-biryani',
        description: 'Succulent Godavari tiger prawns tossed in caramelized shallots, green chillies, and fragrant short-grain chitti mutyalu rice.',
        base_price: 420,
        default_unit: '750 g',
        category_id: 'cat-biryani',
        is_veg: 0,
        spice_level: 4,
        image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80',
        default_stock: 18,
        max_order_qty: 4,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-3',
        name: 'Rayalaseema Ragi Sangati with Natu Kodi Pulusu',
        telugu_name: 'రాగి సంగటి & నాటుకోడి పులుసు',
        slug: 'ragi-sangati-natu-kodi',
        description: 'Authentic finger millet mudde served with country chicken simmered in stone-ground coriander, roasted red chillies, and shallots.',
        base_price: 360,
        default_unit: '1 combo',
        category_id: 'cat-meals',
        is_veg: 0,
        spice_level: 5,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
        default_stock: 20,
        max_order_qty: 4,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-4',
        name: 'Gongura Mamsam (Mutton with Sorrel Leaves)',
        telugu_name: 'గోంగూర మాంసం',
        slug: 'gongura-mamsam',
        description: 'Traditional Guntur red sorrel leaves paste slow-braised with bone-in mutton pieces and cold-pressed sesame oil.',
        base_price: 340,
        default_unit: '500 g',
        category_id: 'cat-curries',
        is_veg: 0,
        spice_level: 4,
        image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=1000&q=80',
        default_stock: 22,
        max_order_qty: 4,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-5',
        name: 'Gutti Vankaya Kura (Stuffed Brinjal Curry)',
        telugu_name: 'గుత్తి వంకాయ కూర',
        slug: 'gutti-vankaya-kura',
        description: 'Small purple tender eggplants stuffed with dry roasted peanuts, sesame seeds, coconut, and whole spices in a rich gravy.',
        base_price: 240,
        default_unit: '500 g',
        category_id: 'cat-curries',
        is_veg: 1,
        spice_level: 3,
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
        default_stock: 30,
        max_order_qty: 6,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-6',
        name: 'Telangana Pacchi Pulusu with Steamed Sona Masoori',
        telugu_name: 'పచ్చి పులుసు & అన్నం',
        slug: 'pacchi-pulusu-rice',
        description: 'Raw tamarind extract tempered with charcoal-roasted onions, green chillies, curry leaves, and cumin, served with hot rice.',
        base_price: 180,
        default_unit: '1 meal',
        category_id: 'cat-meals',
        is_veg: 1,
        spice_level: 3,
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
        default_stock: 25,
        max_order_qty: 5,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-7',
        name: 'Guntur Mirchi Kodi Vepudu (Dry Chicken Fry)',
        telugu_name: 'గుంటూరు మిర్చి కోడి వేపుడు',
        slug: 'guntur-kodi-vepudu',
        description: 'Crisp chicken cubes pan-roasted with spicy Guntur crushed chillies, curry leaves, garlic flakes, and black pepper.',
        base_price: 290,
        default_unit: '450 g',
        category_id: 'cat-snacks',
        is_veg: 0,
        spice_level: 5,
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=80',
        default_stock: 20,
        max_order_qty: 4,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-8',
        name: 'Warangal Sarva Pindi (Crisp Rice Bread)',
        telugu_name: 'వరంగల్ సర్వపిండి',
        slug: 'warangal-sarva-pindi',
        description: 'Traditional Telangana spiced rice flour flatbread with chana dal, sesame seeds, peanuts, and roasted on a shallow brass pan.',
        base_price: 120,
        default_unit: '3 pcs',
        category_id: 'cat-snacks',
        is_veg: 1,
        spice_level: 3,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80',
        default_stock: 30,
        max_order_qty: 6,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-9',
        name: 'Godavari Chakkera Pongali (Ghee Sweet Pongal)',
        telugu_name: 'గోదావరి చక్కెర పొంగలి',
        slug: 'godavari-chakkera-pongali',
        description: 'Rice and roasted moong dal cooked with pure organic jaggery, cow ghee, cardamom, fried cashews, and raisins.',
        base_price: 160,
        default_unit: '350 g',
        category_id: 'cat-desserts',
        is_veg: 1,
        spice_level: 1,
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80',
        default_stock: 25,
        max_order_qty: 5,
        is_featured: 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-10',
        name: 'Avakaya & Ghee Rice Combo with Gongura Pachadi',
        telugu_name: 'ఆవకాయ నెయ్యి అన్నం & గోంగూర',
        slug: 'avakaya-ghee-rice-combo',
        description: 'Hot steamed rice served with freshly made raw mango Avakaya, fresh country butter ghee, and sun-dried roasted chillies.',
        base_price: 190,
        default_unit: '1 bowl',
        category_id: 'cat-meals',
        is_veg: 1,
        spice_level: 4,
        image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80',
        default_stock: 25,
        max_order_qty: 5,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-11',
        name: 'Guntur Idli with Allam Pachadi & Palli Chutney',
        telugu_name: 'గుంటూరు ఇడ్లీ & అల్లం పచ్చడి',
        slug: 'guntur-idli-allam-pachadi',
        description: 'Soft melt-in-mouth steamed idlis served with spicy ginger chutney and creamy roasted peanut chutney.',
        base_price: 90,
        default_unit: '4 pcs',
        category_id: 'cat-tiffins',
        is_veg: 1,
        spice_level: 2,
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
        default_stock: 40,
        max_order_qty: 8,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-12',
        name: 'Bobbattu / Puran Poli with Melted Cow Ghee',
        telugu_name: 'నెయ్యి బొబ్బట్లు',
        slug: 'bobbattu-puran-poli',
        description: 'Handmade thin flour flatbread stuffed with cooked chana dal and cardamon jaggery, topped with melted cow ghee.',
        base_price: 150,
        default_unit: '3 pcs',
        category_id: 'cat-desserts',
        is_veg: 1,
        spice_level: 1,
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80',
        default_stock: 30,
        max_order_qty: 6,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-13',
        name: 'Karivepaku Podi (Curry Leaf Spice Powder)',
        telugu_name: 'కరివేపాకు కారప్పొడి',
        slug: 'karivepaku-podi',
        description: 'Dry roasted shade-dried fresh curry leaves blended with lentils, cumin, garlic, and dried Guntur red chillies.',
        base_price: 110,
        default_unit: '200 g',
        category_id: 'cat-pachadi',
        is_veg: 1,
        spice_level: 3,
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80',
        default_stock: 40,
        max_order_qty: 10,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'food-14',
        name: 'Rajahmundry Rose Milk (Cold Infusion)',
        telugu_name: 'రాజమండ్రి రోజ్ మిల్క్',
        slug: 'rajahmundry-rose-milk',
        description: 'Chilled full-cream milk flavored with organic damask rose extract, basil seeds (sabja), and slivered almonds.',
        base_price: 90,
        default_unit: '350 ml',
        category_id: 'cat-beverages',
        is_veg: 1,
        spice_level: 1,
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1000&q=80',
        default_stock: 35,
        max_order_qty: 6,
        is_featured: 0,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const customers: CustomerRecord[] = [
      {
        id: 'cust-1',
        name: 'Dr. K. Prabhakar',
        phone: '9876543201',
        email: 'prabhakar.k@gmail.com',
        status: 'ACTIVE',
        notes: 'VIP customer. Prefers medium spice on weekend family orders.',
        created_at: '2026-08-10T10:00:00.000Z',
      },
      {
        id: 'cust-2',
        name: 'Sunitha Reddy',
        phone: '9876543202',
        email: 'sunitha.reddy@yahoo.com',
        status: 'ACTIVE',
        notes: 'Regular weekly lunch pre-order.',
        created_at: '2026-08-15T11:30:00.000Z',
      },
      {
        id: 'cust-3',
        name: 'Rajesh Varma',
        phone: '9876543210',
        email: 'rajesh@example.com',
        status: 'ACTIVE',
        created_at: '2026-09-01T09:00:00.000Z',
      },
    ];

    const kitchen_settings: KitchenSettingsRecord = {
      id: 'settings-1',
      kitchen_name: 'Vindu Ruchulu',
      tagline: 'Authentic Telangana & Andhra Home-Style Feasts • Made Fresh Tomorrow',
      phone: '+91 98765 43210',
      email: 'orders@vinduruchulu.com',
      address: 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
      currency: '₹',
      delivery_fee: 40,
      free_delivery_threshold: 600,
      packaging_fee: 20,
      tax_rate: 0.05,
      delivery_slots: [
        'Lunch (12:30 PM - 2:00 PM)',
        'Dinner (7:30 PM - 9:00 PM)',
        'Early Evening Tiffins (5:00 PM - 6:30 PM)'
      ],
      is_kitchen_open: 1,
      ordering_notice: 'We cook all dishes fresh tomorrow morning using stone-ground spices. Orders close at 11:00 PM.',
      allow_guest_checkout: 1,
      operating_hours: '10:00 AM - 11:00 PM Daily',
      ordering_cutoff: '11:00 PM For Next-Day Delivery',
      updated_at: new Date().toISOString(),
    };

    const units = [
      '500 g',
      '750 g',
      '1 kg',
      '250 g',
      '1 plate',
      '4 pcs',
      '3 pcs',
      '8 pcs',
      '1 box',
      '1 serving',
      '1 combo',
      '1 bowl',
      '350 ml',
      '500 ml',
      '1 litre',
      'dozen'
    ];

    return {
      categories,
      food_items,
      menus: [],
      menu_items: [],
      customers,
      orders: [],
      order_items: [],
      order_status_history: [],
      admins: this.getSeedAdmins(),
      kitchen_settings,
      units,
      audit_logs: [
        {
          id: 'log-1',
          admin_id: 'adm-super',
          admin_name: 'Sita Rama Varma',
          action: 'SYSTEM_INITIALIZED',
          entity: 'System',
          entity_id: 'sys-init',
          details: 'Vindu Ruchulu Cloud Kitchen operating environment initialized.',
          created_at: new Date().toISOString(),
        }
      ],
      reviews: this.getSeedReviews(),
      promotions: this.getSeedPromotions(),
      delivery_zones: this.getSeedDeliveryZones(),
      notifications: this.getSeedNotifications(),
    };
  }

  // CATEGORIES
  public getCategories(): CategoryRecord[] {
    return this.data.categories.filter(c => c.is_active === 1).sort((a, b) => a.sort_order - b.sort_order);
  }

  public getAllCategories(): CategoryRecord[] {
    return this.data.categories.sort((a, b) => a.sort_order - b.sort_order);
  }

  public createCategory(input: Omit<CategoryRecord, 'id'>): CategoryRecord {
    const newCat: CategoryRecord = {
      id: `cat-${Date.now().toString(36)}`,
      ...input,
    };
    this.data.categories.push(newCat);
    this.logAudit('ADMIN', 'Admin', 'CATEGORY_CREATED', 'Category', newCat.id, `Created category '${newCat.name}'`);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryRecord>): CategoryRecord | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // FOOD ITEMS
  public getFoodItems(filter?: { categoryId?: string; isVeg?: boolean; featured?: boolean }): FoodItemRecord[] {
    let items = this.data.food_items.filter(f => f.is_active === 1);
    if (filter?.categoryId) items = items.filter(f => f.category_id === filter.categoryId);
    if (filter?.isVeg !== undefined) items = items.filter(f => Boolean(f.is_veg) === filter.isVeg);
    if (filter?.featured !== undefined) items = items.filter(f => Boolean(f.is_featured) === filter.featured);
    return items;
  }

  public getFoodItemById(id: string): FoodItemRecord | undefined {
    return this.data.food_items.find(f => f.id === id);
  }

  public createFoodItem(food: Omit<FoodItemRecord, 'id' | 'created_at' | 'updated_at'>): FoodItemRecord {
    const id = `food-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newItem: FoodItemRecord = {
      id,
      ...food,
      created_at: now,
      updated_at: now,
    };
    this.data.food_items.push(newItem);
    this.logAudit('ADMIN', 'Admin', 'FOOD_ITEM_CREATED', 'FoodItem', newItem.id, `Created recipe '${newItem.name}' at ₹${newItem.base_price}/${newItem.default_unit}`);
    this.save();
    return newItem;
  }

  public updateFoodItem(id: string, updates: Partial<FoodItemRecord>): FoodItemRecord | null {
    const idx = this.data.food_items.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.data.food_items[idx] = {
      ...this.data.food_items[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAudit('ADMIN', 'Admin', 'FOOD_ITEM_UPDATED', 'FoodItem', id, `Updated recipe details for '${this.data.food_items[idx].name}'`);
    this.save();
    return this.data.food_items[idx];
  }

  public deleteFoodItem(id: string): boolean {
    const idx = this.data.food_items.findIndex(f => f.id === id);
    if (idx === -1) return false;
    const deletedName = this.data.food_items[idx].name;
    this.data.food_items.splice(idx, 1);
    this.logAudit('ADMIN', 'Admin', 'FOOD_ITEM_DELETED', 'FoodItem', id, `Deleted recipe '${deletedName}'`);
    this.save();
    return true;
  }

  // MENUS (DATE-BASED NEXT-DAY PLANNING)
  public getMenuByDate(dateStr: string): { menu: MenuRecord; items: MenuItemRecord[] } {
    let menu = this.data.menus.find(m => m.menu_date === dateStr);
    
    if (!menu) {
      // Auto-create menu for this date from active food catalog
      const d = new Date(dateStr + 'T00:00:00');
      const isTomorrow = dateStr === this.getTomorrowDate();
      menu = {
        id: `menu-${dateStr}`,
        menu_date: dateStr,
        title: isTomorrow ? `Special Next-Day Feast (${dateStr})` : `Curated Telugu Feast for ${dateStr}`,
        note: 'Fresh morning preparation using stone-ground spices and cold-pressed oil.',
        status: 'PUBLISHED',
        is_published: 1,
        is_accepting_orders: 1,
        cutoff_time: '11:00 PM',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.menus.push(menu);

      // Populate default items
      this.data.food_items.forEach((food, idx) => {
        this.data.menu_items.push({
          id: `mi-${dateStr}-${food.id}`,
          menu_id: menu!.id,
          food_item_id: food.id,
          available_quantity: food.default_stock,
          remaining_stock: food.default_stock,
          max_order_qty: food.max_order_qty,
          status: 'AVAILABLE',
          sort_order: idx,
        });
      });
      this.save();
    }

    const mItems = this.data.menu_items.filter(mi => mi.menu_id === menu!.id);
    const populated = mItems.map(mi => {
      const food = this.getFoodItemById(mi.food_item_id);
      return {
        ...mi,
        food,
      };
    }).filter(i => Boolean(i.food)) as MenuItemRecord[];

    return { menu, items: populated };
  }

  public getMenuCalendar(startDate: string, days: number = 7): MenuRecord[] {
    const results: MenuRecord[] = [];
    const base = new Date(startDate + 'T00:00:00');
    for (let i = 0; i < days; i++) {
      const current = new Date(base);
      current.setDate(base.getDate() + i);
      const dStr = dateKey(current);
      const { menu } = this.getMenuByDate(dStr);
      results.push(menu);
    }
    return results;
  }

  public updateMenu(dateStr: string, updates: Partial<MenuRecord>): MenuRecord | null {
    const idx = this.data.menus.findIndex(m => m.menu_date === dateStr);
    if (idx === -1) return null;
    this.data.menus[idx] = {
      ...this.data.menus[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.logAudit('ADMIN', 'Admin', 'MENU_UPDATED', 'Menu', this.data.menus[idx].id, `Updated menu for date ${dateStr}`);
    this.save();
    return this.data.menus[idx];
  }

  public updateMenuItemStock(menuId: string, foodItemId: string, remainingStock: number, status?: MenuItemRecord['status']): MenuItemRecord | null {
    const item = this.data.menu_items.find(mi => mi.menu_id === menuId && mi.food_item_id === foodItemId);
    if (!item) return null;

    item.remaining_stock = Math.max(0, remainingStock);
    if (status) {
      item.status = status;
    } else {
      if (item.remaining_stock <= 0) item.status = 'SOLD_OUT';
      else if (item.remaining_stock <= 5) item.status = 'LOW_STOCK';
      else item.status = 'AVAILABLE';
    }

    this.save();
    return item;
  }

  public duplicateMenu(sourceDate: string, targetDate: string): MenuRecord {
    const source = this.getMenuByDate(sourceDate);
    const existingTargetIdx = this.data.menus.findIndex(m => m.menu_date === targetDate);

    const targetMenuId = `menu-${targetDate}`;
    const newMenu: MenuRecord = {
      id: targetMenuId,
      menu_date: targetDate,
      title: `Special Menu for ${targetDate}`,
      note: source.menu.note,
      status: 'PUBLISHED',
      is_published: 1,
      is_accepting_orders: 1,
      cutoff_time: source.menu.cutoff_time,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingTargetIdx >= 0) {
      this.data.menus[existingTargetIdx] = newMenu;
      this.data.menu_items = this.data.menu_items.filter(mi => mi.menu_id !== targetMenuId);
    } else {
      this.data.menus.push(newMenu);
    }

    source.items.forEach((item, idx) => {
      this.data.menu_items.push({
        id: `mi-${targetDate}-${item.food_item_id}`,
        menu_id: targetMenuId,
        food_item_id: item.food_item_id,
        price_override: item.price_override,
        unit_override: item.unit_override,
        available_quantity: item.available_quantity,
        remaining_stock: item.available_quantity,
        max_order_qty: item.max_order_qty,
        status: 'AVAILABLE',
        sort_order: idx,
      });
    });

    this.logAudit('ADMIN', 'Admin', 'MENU_DUPLICATED', 'Menu', targetMenuId, `Duplicated menu from ${sourceDate} to ${targetDate}`);
    this.save();
    return newMenu;
  }

  // ORDERS & CUSTOMERS
  public getOrders(filters?: { date?: string; status?: string; phone?: string; searchQuery?: string }): OrderRecord[] {
    let list = this.data.orders;
    if (filters?.date && filters.date !== 'ALL') list = list.filter(o => o.menu_date === filters.date);
    if (filters?.status && filters.status !== 'ALL') list = list.filter(o => o.order_status === filters.status);
    if (filters?.phone) list = list.filter(o => o.customer_phone.includes(filters.phone!));
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(o => 
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }

    return list.map(o => ({
      ...o,
      items: this.data.order_items.filter(oi => oi.order_id === o.id),
      history: this.data.order_status_history.filter(h => h.order_id === o.id),
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrderByIdOrNumber(identifier: string): OrderRecord | undefined {
    const o = this.data.orders.find(ord => ord.id === identifier || ord.order_number.toUpperCase() === identifier.toUpperCase());
    if (!o) return undefined;
    return {
      ...o,
      items: this.data.order_items.filter(oi => oi.order_id === o.id),
      history: this.data.order_status_history.filter(h => h.order_id === o.id),
    };
  }

  public createOrder(orderInput: {
    customer: { id?: string; name: string; phone: string; email?: string };
    delivery: { address: string; landmark?: string; pincode: string; city: string; slot: string; instructions?: string };
    items: { food_item_id: string; quantity: number }[];
    menu_date: string;
    subtotal: number;
    delivery_fee: number;
    packaging_fee: number;
    discount: number;
    total: number;
    payment_method: string;
    payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }): OrderRecord {
    // 1. Get or create customer
    let customer = orderInput.customer.id ? this.data.customers.find(c => c.id === orderInput.customer.id && c.is_deleted !== 1) : undefined;
    if (!customer && orderInput.customer.email) {
      customer = this.getCustomerByEmail(orderInput.customer.email) || undefined;
    }
    if (!customer && orderInput.customer.phone) {
      customer = this.data.customers.find(c => c.phone === orderInput.customer.phone && c.is_deleted !== 1);
    }

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: orderInput.customer.name,
        phone: orderInput.customer.phone,
        email: orderInput.customer.email,
        status: 'ACTIVE',
        addresses: [],
        favorites: [],
        notifications_enabled: true,
        marketing_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };
      this.data.customers.push(customer);
    } else {
      if (orderInput.customer.name && (!customer.name || customer.name === 'Valued Customer')) {
        customer.name = orderInput.customer.name;
      }
      if (orderInput.customer.phone && !customer.phone) {
        customer.phone = orderInput.customer.phone;
      }
      customer.last_login_at = new Date().toISOString();
      customer.updated_at = new Date().toISOString();
    }

    // 2. Generate unique order number
    const seq = 10480 + this.data.orders.length + Math.floor(Math.random() * 10) + 1;
    const orderNumber = `TEL-${seq}`;
    const orderId = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: orderId,
      order_number: orderNumber,
      customer_id: customer.id,
      customer_name: orderInput.customer.name,
      customer_phone: orderInput.customer.phone,
      customer_email: orderInput.customer.email,
      delivery_address_line: orderInput.delivery.address,
      delivery_landmark: orderInput.delivery.landmark,
      delivery_pincode: orderInput.delivery.pincode,
      delivery_city: orderInput.delivery.city,
      delivery_slot: orderInput.delivery.slot,
      cooking_instructions: orderInput.delivery.instructions,
      menu_date: orderInput.menu_date,
      subtotal: orderInput.subtotal,
      delivery_fee: orderInput.delivery_fee,
      packaging_fee: orderInput.packaging_fee,
      discount: orderInput.discount,
      total: orderInput.total,
      payment_method: orderInput.payment_method,
      payment_status: orderInput.payment_status,
      razorpay_order_id: orderInput.razorpay_order_id,
      razorpay_payment_id: orderInput.razorpay_payment_id,
      razorpay_signature: orderInput.razorpay_signature,
      order_status: 'CONFIRMED',
      delivery_status: 'UNASSIGNED',
      created_at: now,
      updated_at: now,
    };

    // 3. Create immutable order item records and deduct inventory
    const createdOrderItems: OrderItemRecord[] = [];
    const targetMenu = this.data.menus.find(m => m.menu_date === orderInput.menu_date);

    for (const item of orderInput.items) {
      const food = this.getFoodItemById(item.food_item_id);
      if (!food) continue;

      const oi: OrderItemRecord = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_id: orderId,
        food_item_id: food.id,
        food_name: food.name,
        telugu_name: food.telugu_name,
        price_at_purchase: food.base_price,
        unit_at_purchase: food.default_unit,
        quantity: item.quantity,
        item_total: food.base_price * item.quantity,
        image_url: food.image_url,
        is_veg: food.is_veg,
        spice_level: food.spice_level,
      };

      createdOrderItems.push(oi);
      this.data.order_items.push(oi);

      // Deduct stock from day's menu
      if (targetMenu) {
        const menuItem = this.data.menu_items.find(mi => mi.menu_id === targetMenu.id && mi.food_item_id === food.id);
        if (menuItem) {
          menuItem.remaining_stock = Math.max(0, menuItem.remaining_stock - item.quantity);
          if (menuItem.remaining_stock <= 0) menuItem.status = 'SOLD_OUT';
          else if (menuItem.remaining_stock <= 5) menuItem.status = 'LOW_STOCK';
        }
      }
    }

    // 4. Record initial status history
    this.data.order_status_history.push({
      id: `osh-${Date.now()}`,
      order_id: orderId,
      status: 'CONFIRMED',
      note: `Order confirmed via ${orderInput.payment_method}`,
      updated_by: 'System',
      created_at: now,
    });

    this.data.orders.unshift(newOrder);

    // 5. In-app notification for customer
    this.createNotification({
      customer_id: customer.id,
      title: `Order #${orderNumber} Confirmed! 🍛`,
      message: `Your feast for ${orderInput.menu_date} (${orderInput.delivery.slot}) is confirmed and scheduled for morning preparation.`,
      type: 'ORDER',
      link: `/profile?tab=orders`,
    });

    this.save();

    return {
      ...newOrder,
      items: createdOrderItems,
    };
  }

  public updateOrderStatus(orderId: string, status: OrderRecord['order_status'], note?: string, updatedBy: string = 'Admin'): OrderRecord | null {
    const o = this.data.orders.find(ord => ord.id === orderId || ord.order_number === orderId);
    if (!o) return null;

    o.order_status = status;
    o.updated_at = new Date().toISOString();

    if (status === 'OUT_FOR_DELIVERY') o.delivery_status = 'OUT_FOR_DELIVERY';
    if (status === 'DELIVERED') o.delivery_status = 'DELIVERED';

    this.data.order_status_history.push({
      id: `osh-${Date.now()}`,
      order_id: o.id,
      status,
      note: note || `Status updated to ${status}`,
      updated_by: updatedBy,
      created_at: new Date().toISOString(),
    });

    // In-app notification for customer
    if (o.customer_id) {
      this.createNotification({
        customer_id: o.customer_id,
        title: `Order #${o.order_number}: ${status.replace(/_/g, ' ')}`,
        message: note || `Your feast status is now ${status.replace(/_/g, ' ')}.`,
        type: 'ORDER',
        link: `/profile?tab=orders`,
      });
    }

    this.logAudit(updatedBy, updatedBy, 'ORDER_STATUS_CHANGED', 'Order', o.id, `Status transitioned to ${status} (#${o.order_number})`);
    this.save();
    return this.getOrderByIdOrNumber(o.id)!;
  }

  public assignOrderRider(orderId: string, riderName: string, riderPhone: string): OrderRecord | null {
    const o = this.data.orders.find(ord => ord.id === orderId || ord.order_number === orderId);
    if (!o) return null;
    o.assigned_rider_name = riderName;
    o.assigned_rider_phone = riderPhone;
    o.delivery_status = 'ASSIGNED';
    o.updated_at = new Date().toISOString();
    this.save();
    return this.getOrderByIdOrNumber(o.id)!;
  }

  // CUSTOMERS CRM & GOOGLE AUTHENTICATION
  public getCustomers(): (CustomerRecord & { ordersCount: number; totalSpend: number; total_orders: number; total_spend: number; last_order?: string | null; address?: string })[] {
    return this.data.customers
      .filter(c => c.is_deleted !== 1)
      .map(c => {
        const custOrders = this.data.orders.filter(o => o.customer_id === c.id || (c.phone && o.customer_phone === c.phone));
        const totalSpend = custOrders.reduce((sum, o) => sum + (o.order_status !== 'CANCELLED' ? o.total : 0), 0);
        const lastOrder = custOrders[0]?.created_at || custOrders[0]?.menu_date || null;
        const defaultAddr = c.addresses?.find(a => a.is_default) || c.addresses?.[0];
        return {
          ...c,
          ordersCount: custOrders.length,
          totalSpend,
          total_orders: custOrders.length,
          total_spend: totalSpend,
          last_order: lastOrder,
          address: defaultAddr ? `${defaultAddr.house_flat}, ${defaultAddr.area}, ${defaultAddr.city} - ${defaultAddr.pincode}` : '',
        };
      }).sort((a, b) => b.totalSpend - a.totalSpend);
  }


  public getCustomerById(id: string): (CustomerRecord & { orders?: OrderRecord[] }) | null {
    const c = this.data.customers.find(cust => (cust.id === id || (cust.phone && cust.phone === id) || (cust.email && cust.email.toLowerCase() === id.toLowerCase())) && cust.is_deleted !== 1);
    if (!c) return null;
    const orders = this.data.orders.filter(o => o.customer_id === c.id || (c.phone && o.customer_phone === c.phone));
    return {
      ...c,
      addresses: c.addresses || [],
      favorites: c.favorites || [],
      orders,
    };
  }

  public getCustomerByGoogleId(googleId: string): CustomerRecord | null {
    const c = this.data.customers.find(cust => cust.google_id === googleId && cust.is_deleted !== 1);
    return c || null;
  }

  public getCustomerByEmail(email: string): CustomerRecord | null {
    const cleanEmail = email.trim().toLowerCase();
    const c = this.data.customers.find(cust => cust.email?.toLowerCase() === cleanEmail && cust.is_deleted !== 1);
    return c || null;
  }

  public findOrCreateCustomerByGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    profileImage?: string;
    phone?: string;
  }): CustomerRecord {
    const now = new Date().toISOString();
    const cleanEmail = profile.email.trim().toLowerCase();

    // 1. Search by google_id or email
    let customer = this.data.customers.find(
      c => (c.google_id === profile.googleId || (c.email && c.email.toLowerCase() === cleanEmail)) && c.is_deleted !== 1
    );

    if (customer) {
      // Link / update profile
      customer.google_id = profile.googleId;
      if (!customer.profile_image && profile.profileImage) customer.profile_image = profile.profileImage;
      if (!customer.name || customer.name === 'Valued Customer') customer.name = profile.name;
      if (profile.phone && !customer.phone) customer.phone = profile.phone;
      customer.last_login_at = now;
      customer.updated_at = now;
      this.save();
      return customer;
    }

    // 2. Create new customer
    const newCustomer: CustomerRecord = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      google_id: profile.googleId,
      name: profile.name || 'Valued Food Lover',
      email: cleanEmail,
      phone: profile.phone || '',
      profile_image: profile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || 'Customer')}`,
      status: 'ACTIVE',
      addresses: [],
      favorites: [],
      notifications_enabled: true,
      marketing_enabled: true,
      is_deleted: 0,
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    this.data.customers.push(newCustomer);

    // Welcome in-app notification
    this.createNotification({
      customer_id: newCustomer.id,
      title: `Namaskaram, ${newCustomer.name.split(' ')[0]}! 🙏`,
      message: 'Welcome to Vindu Ruchulu! Explore tomorrow’s authentic Telugu feast menu and enjoy handcrafted home-style meals.',
      type: 'SYSTEM',
      link: '/profile',
    });

    this.save();
    return newCustomer;
  }

  public updateCustomerProfile(
    id: string,
    updates: {
      name?: string;
      phone?: string;
      notifications_enabled?: boolean;
      marketing_enabled?: boolean;
      profile_image?: string;
    }
  ): CustomerRecord | null {
    const c = this.data.customers.find(cust => cust.id === id && cust.is_deleted !== 1);
    if (!c) return null;

    if (updates.name !== undefined) c.name = updates.name.trim();
    if (updates.phone !== undefined) c.phone = updates.phone.trim();
    if (updates.notifications_enabled !== undefined) c.notifications_enabled = updates.notifications_enabled;
    if (updates.marketing_enabled !== undefined) c.marketing_enabled = updates.marketing_enabled;
    if (updates.profile_image !== undefined) c.profile_image = updates.profile_image;
    c.updated_at = new Date().toISOString();

    this.save();
    return c;
  }

  public addCustomerAddress(customerId: string, address: Omit<CustomerAddressRecord, 'id'>): CustomerAddressRecord | null {
    const c = this.data.customers.find(cust => cust.id === customerId && cust.is_deleted !== 1);
    if (!c) return null;

    if (!c.addresses) c.addresses = [];

    // If first address or marked default, un-default others
    const isFirst = c.addresses.length === 0;
    const shouldBeDefault = isFirst || address.is_default;

    if (shouldBeDefault) {
      c.addresses.forEach(a => { a.is_default = false; });
    }

    const newAddr: CustomerAddressRecord = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      ...address,
      is_default: shouldBeDefault,
    };

    c.addresses.push(newAddr);
    c.updated_at = new Date().toISOString();
    this.save();
    return newAddr;
  }

  public updateCustomerAddress(
    customerId: string,
    addressId: string,
    addressUpdates: Partial<CustomerAddressRecord>
  ): CustomerAddressRecord | null {
    const c = this.data.customers.find(cust => cust.id === customerId && cust.is_deleted !== 1);
    if (!c || !c.addresses) return null;

    const idx = c.addresses.findIndex(a => a.id === addressId);
    if (idx === -1) return null;

    if (addressUpdates.is_default) {
      c.addresses.forEach(a => { a.is_default = false; });
    }

    c.addresses[idx] = {
      ...c.addresses[idx],
      ...addressUpdates,
    };
    c.updated_at = new Date().toISOString();
    this.save();
    return c.addresses[idx];
  }

  public deleteCustomerAddress(customerId: string, addressId: string): boolean {
    const c = this.data.customers.find(cust => cust.id === customerId && cust.is_deleted !== 1);
    if (!c || !c.addresses) return false;

    const idx = c.addresses.findIndex(a => a.id === addressId);
    if (idx === -1) return false;

    const wasDefault = c.addresses[idx].is_default;
    c.addresses.splice(idx, 1);

    if (wasDefault && c.addresses.length > 0) {
      c.addresses[0].is_default = true;
    }

    c.updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  public setDefaultAddress(customerId: string, addressId: string): boolean {
    const c = this.data.customers.find(cust => cust.id === customerId && cust.is_deleted !== 1);
    if (!c || !c.addresses) return false;

    let found = false;
    c.addresses.forEach(a => {
      if (a.id === addressId) {
        a.is_default = true;
        found = true;
      } else {
        a.is_default = false;
      }
    });

    if (found) {
      c.updated_at = new Date().toISOString();
      this.save();
    }
    return found;
  }

  public toggleCustomerFavorite(customerId: string, foodItemId: string): string[] {
    const c = this.data.customers.find(cust => cust.id === customerId && cust.is_deleted !== 1);
    if (!c) return [];

    if (!c.favorites) c.favorites = [];
    const idx = c.favorites.indexOf(foodItemId);
    if (idx > -1) {
      c.favorites.splice(idx, 1);
    } else {
      c.favorites.push(foodItemId);
    }
    c.updated_at = new Date().toISOString();
    this.save();
    return c.favorites;
  }

  public softDeleteCustomer(customerId: string): boolean {
    const c = this.data.customers.find(cust => cust.id === customerId);
    if (!c) return false;

    // Soft-delete / anonymize to preserve historical order records
    c.is_deleted = 1;
    c.status = 'BLOCKED';
    c.name = `Former Customer (${c.id.substring(c.id.length - 4)})`;
    c.email = undefined;
    c.google_id = undefined;
    c.phone = c.phone ? `*deleted*${c.phone.slice(-4)}` : '';
    c.addresses = [];
    c.favorites = [];
    c.notes = 'Account voluntarily closed by customer.';
    c.updated_at = new Date().toISOString();

    this.save();
    return true;
  }

  public getCustomerOrders(customerIdOrPhone: string): OrderRecord[] {
    const orders = this.data.orders.filter(
      o => o.customer_id === customerIdOrPhone || o.customer_phone === customerIdOrPhone
    );

    return orders.map(o => ({
      ...o,
      items: this.data.order_items.filter(oi => oi.order_id === o.id),
      history: this.data.order_status_history.filter(h => h.order_id === o.id),
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public updateCustomerNotes(id: string, notes: string): CustomerRecord | null {
    const c = this.data.customers.find(cust => cust.id === id);
    if (!c) return null;
    c.notes = notes;
    this.save();
    return c;
  }

  public toggleCustomerStatus(id: string, status: 'ACTIVE' | 'BLOCKED'): CustomerRecord | null {
    const c = this.data.customers.find(cust => cust.id === id);
    if (!c) return null;
    c.status = status;
    this.save();
    return c;
  }

  // DELIVERY ZONES
  public getDeliveryZones(): DeliveryZoneRecord[] {
    return this.data.delivery_zones.sort((a, b) => a.delivery_fee - b.delivery_fee);
  }

  public createDeliveryZone(zone: Omit<DeliveryZoneRecord, 'id'>): DeliveryZoneRecord {
    const newZone: DeliveryZoneRecord = {
      id: `zone-${Date.now().toString(36)}`,
      ...zone,
    };
    this.data.delivery_zones.push(newZone);
    this.logAudit('ADMIN', 'Admin', 'DELIVERY_ZONE_CREATED', 'DeliveryZone', newZone.id, `Created zone '${newZone.name}' with fee ₹${newZone.delivery_fee}`);
    this.save();
    return newZone;
  }

  public updateDeliveryZone(id: string, updates: Partial<DeliveryZoneRecord>): DeliveryZoneRecord | null {
    const idx = this.data.delivery_zones.findIndex(z => z.id === id);
    if (idx === -1) return null;
    this.data.delivery_zones[idx] = { ...this.data.delivery_zones[idx], ...updates };
    this.logAudit('ADMIN', 'Admin', 'DELIVERY_ZONE_UPDATED', 'DeliveryZone', id, `Updated delivery zone '${this.data.delivery_zones[idx].name}'`);
    this.save();
    return this.data.delivery_zones[idx];
  }

  public deleteDeliveryZone(id: string): boolean {
    const idx = this.data.delivery_zones.findIndex(z => z.id === id);
    if (idx === -1) return false;
    this.data.delivery_zones.splice(idx, 1);
    this.save();
    return true;
  }

  public calculateDeliveryFeeForPincode(pincode: string, orderSubtotal: number = 0): { deliveryFee: number; zoneName: string; freeDelivery: boolean } {
    const cleanPin = pincode.trim();
    const matchedZone = this.data.delivery_zones.find(z => z.is_active === 1 && z.pincodes.includes(cleanPin));

    const freeThreshold = this.data.kitchen_settings.free_delivery_threshold || 600;
    if (orderSubtotal >= freeThreshold && orderSubtotal > 0) {
      return {
        deliveryFee: 0,
        zoneName: matchedZone ? matchedZone.name : 'Hyderabad Standard',
        freeDelivery: true,
      };
    }

    if (matchedZone) {
      return {
        deliveryFee: matchedZone.delivery_fee,
        zoneName: matchedZone.name,
        freeDelivery: false,
      };
    }

    return {
      deliveryFee: this.data.kitchen_settings.delivery_fee || 40,
      zoneName: 'Hyderabad Standard Metro',
      freeDelivery: false,
    };
  }

  // IN-APP NOTIFICATIONS
  public getNotifications(customerId: string): NotificationRecord[] {
    return this.data.notifications
      .filter(n => n.customer_id === customerId || n.customer_id === 'ALL')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(notif: Omit<NotificationRecord, 'id' | 'created_at' | 'read'>): NotificationRecord {
    const newN: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...notif,
      read: 0,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(newN);
    if (this.data.notifications.length > 500) this.data.notifications.pop();
    this.save();
    return newN;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find(notif => notif.id === id);
    if (!n) return false;
    n.read = 1;
    this.save();
    return true;
  }

  public getAdminAlerts(): { id: string; type: 'URGENT' | 'WARNING' | 'INFO' | 'SUCCESS'; title: string; message: string; timestamp: string }[] {
    const alerts: { id: string; type: 'URGENT' | 'WARNING' | 'INFO' | 'SUCCESS'; title: string; message: string; timestamp: string }[] = [];
    const today = this.getTodayDate();
    const tomorrow = this.getTomorrowDate();

    // 1. Pending orders alert
    const pendingOrders = this.data.orders.filter(o => o.order_status === 'PENDING' || o.order_status === 'CONFIRMED');
    if (pendingOrders.length > 0) {
      alerts.push({
        id: 'alt-pending-orders',
        type: 'URGENT',
        title: `${pendingOrders.length} New Orders Require Prep`,
        message: 'Active pre-orders awaiting kitchen confirmation and batch cooking.',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Tomorrow's low stock alert
    const tomMenu = this.getMenuByDate(tomorrow);
    const lowStockItems = tomMenu.items.filter(i => i.status === 'LOW_STOCK' || (i.remaining_stock > 0 && i.remaining_stock <= 5));
    if (lowStockItems.length > 0) {
      alerts.push({
        id: 'alt-low-stock',
        type: 'WARNING',
        title: `${lowStockItems.length} Dishes Low on Stock`,
        message: `${lowStockItems.map(i => i.food?.name).filter(Boolean).slice(0, 2).join(', ')} almost sold out.`,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Tomorrow's menu publication status
    if (tomMenu.menu.status !== 'PUBLISHED') {
      alerts.push({
        id: 'alt-menu-draft',
        type: 'WARNING',
        title: 'Tomorrow Menu Not Published',
        message: 'Customers cannot place orders until tomorrow feast menu is published.',
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Lunch slot capacity alert
    const lunchOrders = this.data.orders.filter(o => o.menu_date === tomorrow && o.delivery_slot.toLowerCase().includes('lunch') && o.order_status !== 'CANCELLED').length;
    if (lunchOrders >= 25) {
      alerts.push({
        id: 'alt-lunch-capacity',
        type: 'WARNING',
        title: 'Lunch Delivery Slot Nearly Full',
        message: `${lunchOrders}/30 maximum capacity booked for tomorrow lunch.`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  // KITCHEN OPERATIONS SUMMARY & KANBAN
  public getKitchenOperationsSummary(date: string = this.getTomorrowDate()) {
    const orders = this.data.orders.filter(o => o.menu_date === date && o.order_status !== 'CANCELLED');
    const lunchOrders = orders.filter(o => o.delivery_slot.toLowerCase().includes('lunch')).length;
    const dinnerOrders = orders.filter(o => o.delivery_slot.toLowerCase().includes('dinner') || o.delivery_slot.toLowerCase().includes('evening')).length;

    let totalPortions = 0;
    let vegPortions = 0;
    let nonVegPortions = 0;

    for (const ord of orders) {
      const items = this.data.order_items.filter(oi => oi.order_id === ord.id);
      for (const it of items) {
        totalPortions += it.quantity;
        if (it.is_veg === 1) vegPortions += it.quantity;
        else nonVegPortions += it.quantity;
      }
    }

    const revenue = orders.reduce((sum, o) => sum + (o.payment_status === 'PAID' ? o.total : 0), 0);
    const pendingPayments = orders.filter(o => o.payment_status === 'PENDING').reduce((sum, o) => sum + o.total, 0);

    const pendingPrep = orders.filter(o => o.order_status === 'PENDING' || o.order_status === 'CONFIRMED').length;
    const preparingOrders = orders.filter(o => o.order_status === 'PREPARING').length;
    const readyOrders = orders.filter(o => o.order_status === 'READY').length;
    const deliveryOrders = orders.filter(o => o.order_status === 'OUT_FOR_DELIVERY').length;
    const deliveredOrders = orders.filter(o => o.order_status === 'DELIVERED').length;
    const cancelledOrders = this.data.orders.filter(o => o.menu_date === date && o.order_status === 'CANCELLED').length;

    return {
      date,
      totalOrders: orders.length,
      lunchOrders,
      dinnerOrders,
      totalPortions,
      vegPortions,
      nonVegPortions,
      revenue,
      pendingPayments,
      pendingPrep,
      preparingOrders,
      readyOrders,
      deliveryOrders,
      deliveredOrders,
      cancelledOrders,
    };
  }

  public getOrdersKanban(date?: string) {
    const orders = this.getOrders(date ? { date } : undefined);
    return {
      NEW: orders.filter(o => o.order_status === 'PENDING'),
      CONFIRMED: orders.filter(o => o.order_status === 'CONFIRMED'),
      PREPARING: orders.filter(o => o.order_status === 'PREPARING'),
      READY: orders.filter(o => o.order_status === 'READY'),
      OUT_FOR_DELIVERY: orders.filter(o => o.order_status === 'OUT_FOR_DELIVERY'),
      DELIVERED: orders.filter(o => o.order_status === 'DELIVERED'),
    };
  }

  public validateAndReserveInventory(
    items: { food_item_id: string; quantity: number }[],
    menuDate: string
  ): { valid: boolean; error?: string } {
    const { items: menuItems } = this.getMenuByDate(menuDate);

    for (const reqItem of items) {
      const targetItem = menuItems.find(mi => mi.food_item_id === reqItem.food_item_id);
      if (!targetItem) {
        return { valid: false, error: 'One or more items are not available on this menu date.' };
      }
      if (targetItem.status === 'SOLD_OUT' || targetItem.remaining_stock <= 0) {
        return { valid: false, error: `${targetItem.food?.name || 'Item'} is SOLD OUT for ${menuDate}.` };
      }
      if (targetItem.remaining_stock < reqItem.quantity) {
        return {
          valid: false,
          error: `Only ${targetItem.remaining_stock} portions of ${targetItem.food?.name || 'Item'} remain available.`,
        };
      }
    }
    return { valid: true };
  }

  public exportBusinessReportCSV(startDate: string, endDate: string): string {
    const allOrders = this.data.orders.filter(o => o.menu_date >= startDate && o.menu_date <= endDate);
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Slot', 'Total (INR)', 'Payment Status', 'Payment Method', 'Order Status', 'Delivery Pincode', 'Items'];

    const rows = allOrders.map(o => {
      const items = this.data.order_items.filter(oi => oi.order_id === o.id).map(i => `${i.quantity}x ${i.food_name}`).join('; ');
      return [
        o.order_number,
        o.menu_date,
        `"${o.customer_name.replace(/"/g, '""')}"`,
        o.customer_phone,
        `"${o.delivery_slot}"`,
        o.total,
        o.payment_status,
        o.payment_method,
        o.order_status,
        o.delivery_pincode,
        `"${items.replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }


  // PROMOTIONS
  public getPromotions(): PromotionRecord[] {
    return this.data.promotions;
  }

  public createPromotion(promo: Omit<PromotionRecord, 'id' | 'times_used' | 'created_at'>): PromotionRecord {
    const newP: PromotionRecord = {
      id: `promo-${Date.now().toString(36)}`,
      ...promo,
      times_used: 0,
      created_at: new Date().toISOString(),
    };
    this.data.promotions.push(newP);
    this.save();
    return newP;
  }

  public updatePromotion(id: string, updates: Partial<PromotionRecord>): PromotionRecord | null {
    const idx = this.data.promotions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.promotions[idx] = { ...this.data.promotions[idx], ...updates };
    this.save();
    return this.data.promotions[idx];
  }

  public deletePromotion(id: string): boolean {
    const idx = this.data.promotions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.promotions.splice(idx, 1);
    this.save();
    return true;
  }

  // REVIEWS
  public getReviews(): ReviewRecord[] {
    return this.data.reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public replyToReview(id: string, reply: string): ReviewRecord | null {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.reply = reply;
    this.save();
    return rev;
  }

  public updateReviewStatus(id: string, status: ReviewRecord['status']): ReviewRecord | null {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = status;
    this.save();
    return rev;
  }

  // AUDIT LOGS
  public logAudit(adminId: string, adminName: string, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLogRecord = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      admin_id: adminId,
      admin_name: adminName,
      action,
      entity,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 200) this.data.audit_logs.pop();
    this.save();
  }

  public getAuditLogs(limit: number = 100): AuditLogRecord[] {
    return this.data.audit_logs.slice(0, limit);
  }

  // ADMIN USERS (RBAC)
  public getAdmins(): AdminUserRecord[] {
    return this.data.admins;
  }

  public getAdminById(id: string): AdminUserRecord | undefined {
    return this.data.admins.find(a => a.id === id);
  }

  public createAdmin(admin: Omit<AdminUserRecord, 'id' | 'created_at'>): AdminUserRecord {
    const newAdmin: AdminUserRecord = {
      id: `adm-${Date.now().toString(36)}`,
      ...admin,
      created_at: new Date().toISOString(),
    };
    this.data.admins.push(newAdmin);
    this.logAudit('SUPER_ADMIN', 'Super Admin', 'ADMIN_USER_CREATED', 'AdminUser', newAdmin.id, `Created admin user '${newAdmin.username}' with role '${newAdmin.role}'`);
    this.save();
    return newAdmin;
  }

  public updateAdmin(id: string, updates: Partial<AdminUserRecord>): AdminUserRecord | null {
    const idx = this.data.admins.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.admins[idx] = { ...this.data.admins[idx], ...updates };
    this.logAudit('SUPER_ADMIN', 'Super Admin', 'ADMIN_USER_UPDATED', 'AdminUser', id, `Updated credentials/role for '${this.data.admins[idx].username}'`);
    this.save();
    return this.data.admins[idx];
  }

  public deleteAdmin(id: string): boolean {
    const idx = this.data.admins.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.admins.splice(idx, 1);
    this.save();
    return true;
  }

  public verifyAdmin(user: string, pass: string) {
    const admin = this.data.admins.find(a => 
      (a.username.toLowerCase() === user.toLowerCase() || a.email.toLowerCase() === user.toLowerCase()) && 
      a.password_hash === pass
    );

    if (admin && admin.status === 'ACTIVE') {
      admin.last_login = new Date().toISOString();
      this.save();

      // Resolve effective permissions
      const rolePerms = ROLE_PERMISSIONS[admin.role] || [];
      const customPerms = admin.custom_permissions || [];
      const permissions = Array.from(new Set([...rolePerms, ...customPerms]));

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions,
        token: `jwt_${admin.id}_${Date.now()}`,
      };
    }
    return null;
  }

  // DASHBOARD STATS & DEEP ANALYTICS
  public getDashboardStats() {
    const today = this.getTodayDate();
    const tomorrow = this.getTomorrowDate();

    const todayOrders = this.data.orders.filter(o => o.menu_date === today && o.order_status !== 'CANCELLED');
    const tomorrowOrders = this.data.orders.filter(o => o.menu_date === tomorrow && o.order_status !== 'CANCELLED');

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const tomorrowRevenue = tomorrowOrders.reduce((sum, o) => sum + o.total, 0);

    const pendingCount = this.data.orders.filter(o => o.order_status === 'PENDING').length;
    const preparingCount = this.data.orders.filter(o => o.order_status === 'PREPARING' || o.order_status === 'CONFIRMED').length;
    const readyCount = this.data.orders.filter(o => o.order_status === 'READY').length;
    const deliveredCount = this.data.orders.filter(o => o.order_status === 'DELIVERED').length;

    // Item sales aggregation
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const ord of this.data.orders) {
      if (ord.order_status === 'CANCELLED') continue;
      const oItems = this.data.order_items.filter(oi => oi.order_id === ord.id);
      for (const item of oItems) {
        const exist = itemMap.get(item.food_name) || { name: item.food_name, count: 0, revenue: 0 };
        exist.count += item.quantity;
        exist.revenue += item.item_total;
        itemMap.set(item.food_name, exist);
      }
    }
    const topItems = Array.from(itemMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);

    // Tomorrow menu sold out count
    const tomMenu = this.getMenuByDate(tomorrow);
    const soldOutCount = tomMenu.items.filter(i => i.status === 'SOLD_OUT' || i.remaining_stock <= 0).length;
    const lowStockCount = tomMenu.items.filter(i => i.status === 'LOW_STOCK' || (i.remaining_stock > 0 && i.remaining_stock <= 5)).length;

    return {
      todayOrdersCount: todayOrders.length,
      tomorrowOrdersCount: tomorrowOrders.length,
      todayRevenue,
      tomorrowRevenue,
      pendingOrdersCount: pendingCount,
      preparingOrdersCount: preparingCount,
      readyOrdersCount: readyCount,
      completedOrdersCount: deliveredCount,
      soldOutItemsCount: soldOutCount,
      lowStockItemsCount: lowStockCount,
      recentOrders: this.getOrders().slice(0, 8),
      topItems,
    };
  }

  public getDeepAnalytics() {
    const allOrders = this.data.orders.filter(o => o.order_status !== 'CANCELLED');
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Category revenue share
    const catRevenueMap = new Map<string, number>();
    for (const oi of this.data.order_items) {
      const food = this.getFoodItemById(oi.food_item_id);
      const cat = food ? this.data.categories.find(c => c.id === food.category_id)?.name || 'Curries' : 'Other';
      catRevenueMap.set(cat, (catRevenueMap.get(cat) || 0) + oi.item_total);
    }

    const categoryRevenue = Array.from(catRevenueMap.entries()).map(([category, rev]) => ({
      category,
      revenue: rev,
      percentage: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    // Daily breakdown for last 7 days
    const dailyMap = new Map<string, { date: string; orders: number; revenue: number }>();
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(d.getDate() - i);
      const k = dateKey(dayDate);
      dailyMap.set(k, { date: k, orders: 0, revenue: 0 });
    }

    for (const ord of allOrders) {
      const day = ord.menu_date;
      if (dailyMap.has(day)) {
        const entry = dailyMap.get(day)!;
        entry.orders += 1;
        entry.revenue += ord.total;
      }
    }

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      categoryRevenue,
      dailyTrend: Array.from(dailyMap.values()),
      customerCount: this.data.customers.length,
      repeatCustomerCount: this.data.customers.filter(c => {
        const count = this.data.orders.filter(o => o.customer_phone === c.phone).length;
        return count > 1;
      }).length,
    };
  }

  // SETTINGS
  public getSettings(): KitchenSettingsRecord {
    return this.data.kitchen_settings;
  }

  public updateSettings(settings: Partial<KitchenSettingsRecord>): KitchenSettingsRecord {
    this.data.kitchen_settings = {
      ...this.data.kitchen_settings,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    this.logAudit('ADMIN', 'Admin', 'SETTINGS_UPDATED', 'Settings', 'settings-1', 'Updated kitchen operations and delivery settings');
    this.save();
    return this.data.kitchen_settings;
  }

  public getUnits(): string[] {
    return this.data.units;
  }

  public addUnit(unit: string): string[] {
    if (!this.data.units.includes(unit.trim())) {
      this.data.units.push(unit.trim());
      this.save();
    }
    return this.data.units;
  }

  public getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return dateKey(d);
  }

  public getTodayDate(): string {
    return dateKey(new Date());
  }
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const relationalDb = new RelationalDatabase();
