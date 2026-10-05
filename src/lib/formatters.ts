import { KitchenSettingsRecord, OrderRecord } from '@/../database/db';
import { KitchenSettings, Order, FoodItem, MenuItem } from '@/types';

export const DEFAULT_DELIVERY_SLOTS: string[] = [
  'Lunch (12:30 PM - 2:00 PM)',
  'Dinner (7:30 PM - 9:00 PM)',
  'Early Evening Tiffins (5:00 PM - 6:30 PM)',
];

export function formatKitchenSettings(record: KitchenSettingsRecord): KitchenSettings & Record<string, any> {
  const slots = Array.isArray(record.delivery_slots) && record.delivery_slots.length > 0
    ? record.delivery_slots
    : DEFAULT_DELIVERY_SLOTS;

  return {
    kitchenName: record.kitchen_name || 'Vindu Ruchulu',
    tagline: record.tagline || 'Authentic Telangana & Andhra Home-Style Feasts • Made Fresh Tomorrow',
    phone: record.phone || '+91 98765 43210',
    email: record.email || 'orders@vinduruchulu.com',
    address: record.address || 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    currency: record.currency || '₹',
    deliveryFee: typeof record.delivery_fee === 'number' ? record.delivery_fee : 40,
    freeDeliveryThreshold: typeof record.free_delivery_threshold === 'number' ? record.free_delivery_threshold : 600,
    packagingFee: typeof record.packaging_fee === 'number' ? record.packaging_fee : 20,
    taxRate: typeof record.tax_rate === 'number' ? record.tax_rate : 0.05,
    deliverySlots: slots,
    isKitchenOpen: record.is_kitchen_open !== 0,
    orderingNotice: record.ordering_notice || 'We cook all dishes fresh tomorrow morning using stone-ground spices.',
    allowGuestCheckout: record.allow_guest_checkout !== 0,
    // Backwards-compatible snake_case aliases
    id: record.id,
    kitchen_name: record.kitchen_name,
    delivery_fee: record.delivery_fee,
    free_delivery_threshold: record.free_delivery_threshold,
    packaging_fee: record.packaging_fee,
    tax_rate: record.tax_rate,
    delivery_slots: slots,
    is_kitchen_open: record.is_kitchen_open,
    ordering_notice: record.ordering_notice,
    allow_guest_checkout: record.allow_guest_checkout,
    updated_at: record.updated_at,
  };
}

export function normalizeSettingsUpdate(input: any): Partial<KitchenSettingsRecord> {
  const update: Partial<KitchenSettingsRecord> = {};
  if (input.kitchenName !== undefined || input.kitchen_name !== undefined) {
    update.kitchen_name = input.kitchenName || input.kitchen_name;
  }
  if (input.tagline !== undefined) update.tagline = input.tagline;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.email !== undefined) update.email = input.email;
  if (input.address !== undefined) update.address = input.address;
  if (input.currency !== undefined) update.currency = input.currency;
  if (input.deliveryFee !== undefined || input.delivery_fee !== undefined) {
    update.delivery_fee = Number(input.deliveryFee ?? input.delivery_fee);
  }
  if (input.freeDeliveryThreshold !== undefined || input.free_delivery_threshold !== undefined) {
    update.free_delivery_threshold = Number(input.freeDeliveryThreshold ?? input.free_delivery_threshold);
  }
  if (input.packagingFee !== undefined || input.packaging_fee !== undefined) {
    update.packaging_fee = Number(input.packagingFee ?? input.packaging_fee);
  }
  if (input.taxRate !== undefined || input.tax_rate !== undefined) {
    update.tax_rate = Number(input.taxRate ?? input.tax_rate);
  }
  if (input.deliverySlots !== undefined || input.delivery_slots !== undefined) {
    const slots = input.deliverySlots || input.delivery_slots;
    if (Array.isArray(slots) && slots.length > 0) update.delivery_slots = slots;
  }
  if (input.isKitchenOpen !== undefined || input.is_kitchen_open !== undefined) {
    update.is_kitchen_open = (input.isKitchenOpen ?? input.is_kitchen_open) ? 1 : 0;
  }
  if (input.orderingNotice !== undefined || input.ordering_notice !== undefined) {
    update.ordering_notice = input.orderingNotice || input.ordering_notice;
  }
  if (input.allowGuestCheckout !== undefined || input.allow_guest_checkout !== undefined) {
    update.allow_guest_checkout = (input.allowGuestCheckout ?? input.allow_guest_checkout) ? 1 : 0;
  }
  return update;
}

export function formatFoodItem(record: any, categoryName?: string): FoodItem & Record<string, any> {
  const price = typeof record.base_price === 'number' ? record.base_price : (typeof record.price === 'number' ? record.price : 0);
  const unit = record.default_unit || record.unit || 'serving';
  const imageUrl = record.image_url || record.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80';
  const isVeg = record.is_veg === 1 || record.isVeg === true;
  const spiceLevel = record.spice_level || record.spiceLevel || 'MEDIUM';
  const stock = record.default_stock !== undefined ? record.default_stock : (record.availableQuantity !== undefined ? record.availableQuantity : 20);
  const remaining = record.remaining_stock !== undefined ? record.remaining_stock : (record.remainingStock !== undefined ? record.remainingStock : stock);

  return {
    id: record.id,
    name: record.name || '',
    teluguName: record.telugu_name || record.teluguName || '',
    description: record.description || '',
    price,
    unit,
    category: categoryName || record.category || 'Curries',
    isVeg,
    spiceLevel,
    imageUrl,
    availableQuantity: stock,
    remainingStock: remaining,
    maxOrderQty: record.max_order_qty !== undefined ? record.max_order_qty : (record.maxOrderQty || 4),
    status: record.status || 'AVAILABLE',
    isFeatured: record.is_featured === 1 || record.isFeatured === true,
    // snake_case aliases
    base_price: price,
    default_unit: unit,
    image_url: imageUrl,
    is_veg: isVeg ? 1 : 0,
    telugu_name: record.telugu_name || record.teluguName || '',
    spice_level: spiceLevel,
    default_stock: stock,
    remaining_stock: remaining,
    max_order_qty: record.max_order_qty ?? record.maxOrderQty,
    is_featured: (record.is_featured === 1 || record.isFeatured) ? 1 : 0,
  };
}

export function formatMenuItem(record: any): MenuItem & Record<string, any> {
  const food = record.food ? formatFoodItem(record.food) : formatFoodItem({ id: record.food_item_id || record.foodItemId });
  const remainingStock = record.remaining_stock !== undefined ? record.remaining_stock : (record.remainingStock !== undefined ? record.remainingStock : 20);
  const status = record.status || (remainingStock <= 0 ? 'SOLD_OUT' : remainingStock <= 5 ? 'LOW_STOCK' : 'AVAILABLE');

  return {
    id: record.id,
    menuId: record.menu_id || record.menuId,
    foodItemId: record.food_item_id || record.foodItemId || food.id,
    food,
    remainingStock,
    maxOrderQty: record.max_order_qty !== undefined ? record.max_order_qty : (record.maxOrderQty || food.maxOrderQty || 4),
    status,
    // snake_case aliases
    menu_id: record.menu_id || record.menuId,
    food_item_id: record.food_item_id || record.foodItemId || food.id,
    remaining_stock: remainingStock,
    max_order_qty: record.max_order_qty !== undefined ? record.max_order_qty : (record.maxOrderQty || food.maxOrderQty || 4),
  };
}

export function formatOrderRecord(record: any): Order & Record<string, any> {
  const items = (record.items || []).map((it: any) => ({
    foodItemId: it.food_item_id || it.foodItemId || it.id,
    name: it.food_name || it.name || '',
    teluguName: it.telugu_name || it.teluguName || '',
    price: typeof it.price_at_purchase === 'number' ? it.price_at_purchase : (typeof it.price === 'number' ? it.price : 0),
    unit: it.unit_at_purchase || it.unit || 'serving',
    quantity: it.quantity || 1,
    itemTotal: typeof it.item_total === 'number' ? it.item_total : ((it.price_at_purchase || it.price || 0) * (it.quantity || 1)),
    imageUrl: it.image_url || it.imageUrl || '',
    isVeg: it.is_veg === 1 || it.isVeg === true,
    spiceLevel: it.spice_level || it.spiceLevel || 'MEDIUM',
    // snake_case aliases
    food_item_id: it.food_item_id || it.foodItemId || it.id,
    food_name: it.food_name || it.name || '',
    telugu_name: it.telugu_name || it.teluguName || '',
    price_at_purchase: it.price_at_purchase ?? it.price,
    unit_at_purchase: it.unit_at_purchase ?? it.unit,
    item_total: it.item_total ?? ((it.price_at_purchase || it.price || 0) * (it.quantity || 1)),
    image_url: it.image_url || it.imageUrl || '',
    is_veg: it.is_veg ?? (it.isVeg ? 1 : 0),
    spice_level: it.spice_level || it.spiceLevel || 'MEDIUM',
  }));

  const history = (record.history || []).map((h: any) => ({
    id: h.id,
    orderId: h.order_id || h.orderId || record.id,
    status: h.status,
    note: h.note || '',
    updatedBy: h.updated_by || h.updatedBy || 'System',
    timestamp: h.created_at || h.timestamp || record.created_at,
    order_id: h.order_id || h.orderId || record.id,
    updated_by: h.updated_by || h.updatedBy || 'System',
    created_at: h.created_at || h.timestamp || record.created_at,
  }));

  const deliverySlot = record.delivery_slot || record.deliveryAddress?.deliverySlot || 'Lunch (12:30 PM - 2:00 PM)';
  const customerName = record.customer_name || record.customer?.name || '';
  const customerPhone = record.customer_phone || record.customer?.phone || '';
  const customerEmail = record.customer_email || record.customer?.email || '';

  return {
    id: record.id,
    orderNumber: record.order_number || record.orderNumber || '',
    customer: {
      id: record.customer_id || record.customer?.id || '',
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    },
    deliveryAddress: {
      fullName: customerName,
      phone: customerPhone,
      addressLine1: record.delivery_address_line || record.deliveryAddress?.addressLine1 || '',
      addressLine2: record.deliveryAddress?.addressLine2 || '',
      landmark: record.delivery_landmark || record.deliveryAddress?.landmark || '',
      pincode: record.delivery_pincode || record.deliveryAddress?.pincode || '',
      city: record.delivery_city || record.deliveryAddress?.city || 'Hyderabad',
      deliverySlot,
      cookingInstructions: record.cooking_instructions || record.deliveryAddress?.cookingInstructions || '',
    },
    items,
    subtotal: record.subtotal,
    deliveryFee: record.delivery_fee !== undefined ? record.delivery_fee : (record.deliveryFee || 0),
    packagingFee: record.packaging_fee !== undefined ? record.packaging_fee : (record.packagingFee || 0),
    discount: record.discount || 0,
    total: record.total,
    menuDate: record.menu_date || record.menuDate,
    paymentMethod: record.payment_method || record.paymentMethod || 'UPI',
    paymentStatus: record.payment_status || record.paymentStatus || 'PAID',
    razorpayOrderId: record.razorpay_order_id || record.razorpayOrderId,
    razorpayPaymentId: record.razorpay_payment_id || record.razorpayPaymentId,
    razorpaySignature: record.razorpay_signature || record.razorpaySignature,
    orderStatus: record.order_status || record.orderStatus || 'CONFIRMED',
    statusHistory: history,
    createdAt: record.created_at || record.createdAt,
    updatedAt: record.updated_at || record.updatedAt,
    // snake_case root properties
    order_number: record.order_number,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    delivery_address_line: record.delivery_address_line,
    delivery_landmark: record.delivery_landmark,
    delivery_pincode: record.delivery_pincode,
    delivery_city: record.delivery_city,
    delivery_slot: deliverySlot,
    cooking_instructions: record.cooking_instructions,
    menu_date: record.menu_date,
    delivery_fee: record.delivery_fee,
    packaging_fee: record.packaging_fee,
    payment_method: record.payment_method,
    payment_status: record.payment_status,
    order_status: record.order_status,
    created_at: record.created_at,
    updated_at: record.updated_at,
    history,
  };
}
