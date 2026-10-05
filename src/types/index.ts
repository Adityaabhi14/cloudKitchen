export type UnitType = 
  | 'kg' 
  | 'g' 
  | 'litre' 
  | 'ml' 
  | 'pcs' 
  | 'plate' 
  | 'box' 
  | 'serving' 
  | 'dozen' 
  | 'custom'
  | string;

export type ItemStatus = 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT' | 'HIDDEN';

export type SpiceLevel = 1 | 2 | 3 | 4 | 5; // 1: Mild, 2: Medium, 3: Spicy, 4: Andhra Spicy, 5: Telangana Fire

export type FoodCategory = 
  | 'Breakfast'
  | 'Biryani'
  | 'Meals'
  | 'Curries'
  | 'Tiffins'
  | 'Snacks'
  | 'Rice'
  | 'Vegetarian'
  | 'Non-Vegetarian'
  | 'Desserts'
  | 'Beverages'
  | 'Pachadi & Podi'
  | string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  teluguName?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  teluguName?: string;
  slug?: string;
  description: string;
  teluguDescription?: string;
  price: number;
  unit: UnitType;
  category: FoodCategory;
  categoryId?: string;
  isVeg: boolean;
  spiceLevel: SpiceLevel;
  imageUrl: string;
  availableQuantity: number;
  remainingStock: number;
  maxOrderQty: number;
  minOrderQty?: number;
  prepTimeMinutes?: number;
  ingredients?: string[];
  allergens?: string[];
  cookingNotes?: string;
  status: ItemStatus;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type MenuStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export interface DayMenu {
  id: string;
  date: string; // ISO format: 'YYYY-MM-DD'
  displayDate?: string;
  title: string;
  note?: string;
  status?: MenuStatus;
  isPublished: boolean;
  isAcceptingOrders: boolean;
  cutoffTime?: string; // e.g. "10:00 PM"
  items: DayMenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DayMenuItem {
  id?: string;
  menuId?: string;
  foodItemId: string;
  food?: FoodItem;
  customPrice?: number;
  customUnit?: string;
  availableQuantity: number;
  remainingStock: number;
  maxOrderQty: number;
  status: ItemStatus;
  sortOrder?: number;
  mealSlot?: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER' | 'ALL_DAY';
}

export interface MenuItem {
  id: string;
  menuId: string;
  foodItemId: string;
  food: FoodItem;
  remainingStock: number;
  maxOrderQty?: number;
  status: ItemStatus;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'RAZORPAY' | 'COD';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  deliverySlot: string; // e.g. "Lunch (12:30 PM - 2:00 PM)" or "Dinner (7:30 PM - 9:00 PM)"
  cookingInstructions?: string;
}

export interface OrderItem {
  foodItemId: string;
  name: string;
  teluguName?: string;
  price: number;
  unit: string;
  quantity: number;
  itemTotal: number;
  imageUrl: string;
  isVeg: boolean;
  spiceLevel: SpiceLevel;
}

export interface OrderStatusLog {
  id?: string;
  orderId?: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "TEL-10482"
  customer: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  discount: number;
  tax?: number;
  total: number;
  menuDate: string; // The target dining date: 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus: OrderStatus;
  deliveryStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  assignedRider?: {
    name: string;
    phone: string;
  };
  internalNotes?: string;
  statusHistory: OrderStatusLog[];
  createdAt: string;
  updatedAt: string;
}

export interface KitchenSettings {
  kitchenName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  packagingFee: number;
  taxRate: number; // e.g. 0.05
  deliverySlots: string[];
  deliveryZones?: { name: string; pincodes: string[]; fee: number }[];
  isKitchenOpen: boolean;
  orderingNotice: string;
  allowGuestCheckout: boolean;
  operatingHours?: string;
  orderingCutoff?: string;
  socialLinks?: {
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface DashboardOverview {
  todayOrdersCount: number;
  tomorrowOrdersCount: number;
  todayRevenue: number;
  tomorrowRevenue: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  readyOrdersCount?: number;
  outForDeliveryOrdersCount?: number;
  completedOrdersCount: number;
  cancelledOrdersCount?: number;
  soldOutItemsCount: number;
  lowStockItemsCount: number;
  recentOrders: Order[];
  topItems: { name: string; count: number; revenue: number }[];
  categoryRevenue?: { category: string; revenue: number; percentage: number }[];
}

export type AdminRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'KITCHEN_MANAGER' 
  | 'ORDER_MANAGER' 
  | 'INVENTORY_MANAGER' 
  | 'DELIVERY_MANAGER' 
  | 'SUPPORT';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  name: string;
  role: AdminRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  customPermissions?: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSession {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  token: string;
  expiresAt: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
  isDefault: boolean;
}

export interface CustomerUser {
  id: string;
  googleId?: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  status: 'ACTIVE' | 'BLOCKED';
  notes?: string;
  addresses: CustomerAddress[];
  favorites: string[];
  notificationsEnabled: boolean;
  marketingEnabled: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface CustomerSession {
  user: CustomerUser | null;
  token?: string;
}

export interface Customer {
  id: string;
  googleId?: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  status: 'ACTIVE' | 'BLOCKED';
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  notes?: string;
  addresses?: CustomerAddress[];
  savedAddresses?: {
    id: string;
    addressLine: string;
    landmark?: string;
    pincode: string;
    city: string;
    isDefault: boolean;
  }[];
  favorites?: string[];
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  deliveryFee: number;
  minOrder: number;
  maxDistanceKm?: number;
  isActive: boolean;
}

export interface DeliverySlotInfo {
  id: string;
  name: string;
  timeRange: string;
  cutoffTime?: string;
  maxOrders: number;
  currentOrders: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  customerId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'KITCHEN' | 'MENU' | 'PROMO' | 'SYSTEM';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface KitchenOperationsSummary {
  date: string;
  totalOrders: number;
  lunchOrders: number;
  dinnerOrders: number;
  totalPortions: number;
  vegPortions: number;
  nonVegPortions: number;
  revenue: number;
  pendingPayments: number;
  pendingPrep: number;
  readyOrders: number;
  deliveryOrders: number;
  cancelledOrders: number;
}

export interface Review {
  id: string;
  orderId?: string;
  customerName: string;
  dishName?: string;
  rating: number; // 1 to 5
  comment: string;
  reply?: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN' | 'FLAGGED';
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  validUntil: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayRef?: string;
  refundStatus?: 'NONE' | 'REQUESTED' | 'REFUNDED' | 'FAILED';
  refundAmount?: number;
  createdAt: string;
}

