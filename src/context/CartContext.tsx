'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodItem, OrderItem, KitchenSettings } from '@/types';

interface CartContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  cart: OrderItem[];
  addToCart: (item: FoodItem, quantity?: number, customPrice?: number, customUnit?: string) => void;
  removeFromCart: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, newQty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  discount: number;
  appliedPromo: string;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  total: number;
  settings: KitchenSettings | null;
  refreshSettings: () => Promise<void>;
  isTrackModalOpen: boolean;
  setIsTrackModalOpen: (open: boolean) => void;
}

const defaultKitchenSettings: KitchenSettings = {
  kitchenName: 'Vindu Ruchulu',
  tagline: 'Authentic Telangana & Andhra Home-Style Feasts • Made Fresh Tomorrow',
  phone: '+91 98765 43210',
  email: 'orders@vinduruchulu.com',
  address: 'Plot 42, Jubilee Hills Road No. 36, Hyderabad, Telangana 500033',
  currency: '₹',
  deliveryFee: 40,
  freeDeliveryThreshold: 600,
  packagingFee: 20,
  taxRate: 0.05,
  deliverySlots: [
    'Lunch (12:30 PM - 2:00 PM)',
    'Dinner (7:30 PM - 9:00 PM)',
    'Early Evening Tiffins (5:00 PM - 6:30 PM)'
  ],
  isKitchenOpen: true,
  orderingNotice: 'We cook all dishes fresh tomorrow morning.',
  allowGuestCheckout: true,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to compute tomorrow's date
function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState<string>(getTomorrowDateString());
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [settings, setSettings] = useState<KitchenSettings | null>(defaultKitchenSettings);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);

  // Load cart and settings on mount from localStorage
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem('vindu_selected_date');
      if (savedDate) setSelectedDateState(savedDate);

      const savedCart = localStorage.getItem('vindu_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      fetchSettings();
    } catch (e) {
      console.error('Error loading cart state:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vindu_selected_date', selectedDate);
      localStorage.setItem('vindu_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart state:', e);
    }
  }, [selectedDate, cart]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data?.settings) {
        const s = data.data.settings;
        const normalizedSlots = Array.isArray(s.deliverySlots) && s.deliverySlots.length > 0
          ? s.deliverySlots
          : (Array.isArray(s.delivery_slots) && s.delivery_slots.length > 0 ? s.delivery_slots : defaultKitchenSettings.deliverySlots);

        const normalized: KitchenSettings = {
          kitchenName: s.kitchenName || s.kitchen_name || defaultKitchenSettings.kitchenName,
          tagline: s.tagline || defaultKitchenSettings.tagline,
          phone: s.phone || defaultKitchenSettings.phone,
          email: s.email || defaultKitchenSettings.email,
          address: s.address || defaultKitchenSettings.address,
          currency: s.currency || defaultKitchenSettings.currency,
          deliveryFee: typeof s.deliveryFee === 'number' ? s.deliveryFee : (typeof s.delivery_fee === 'number' ? s.delivery_fee : defaultKitchenSettings.deliveryFee),
          freeDeliveryThreshold: typeof s.freeDeliveryThreshold === 'number' ? s.freeDeliveryThreshold : (typeof s.free_delivery_threshold === 'number' ? s.free_delivery_threshold : defaultKitchenSettings.freeDeliveryThreshold),
          packagingFee: typeof s.packagingFee === 'number' ? s.packagingFee : (typeof s.packaging_fee === 'number' ? s.packaging_fee : defaultKitchenSettings.packagingFee),
          taxRate: typeof s.taxRate === 'number' ? s.taxRate : (typeof s.tax_rate === 'number' ? s.tax_rate : defaultKitchenSettings.taxRate),
          deliverySlots: normalizedSlots,
          isKitchenOpen: s.isKitchenOpen !== undefined ? Boolean(s.isKitchenOpen) : (s.is_kitchen_open !== undefined ? Boolean(s.is_kitchen_open) : defaultKitchenSettings.isKitchenOpen),
          orderingNotice: s.orderingNotice || s.ordering_notice || defaultKitchenSettings.orderingNotice,
          allowGuestCheckout: s.allowGuestCheckout !== undefined ? Boolean(s.allowGuestCheckout) : (s.allow_guest_checkout !== undefined ? Boolean(s.allow_guest_checkout) : defaultKitchenSettings.allowGuestCheckout),
        };
        setSettings(normalized);
      }
    } catch (e) {
      console.error('Failed to load settings, keeping default safe settings:', e);
    }
  };

  const setSelectedDate = (date: string) => {
    if (cart.length > 0 && date !== selectedDate) {
      const confirmChange = window.confirm(
        `You have items in your cart for ${selectedDate}. Changing the menu date will clear your current cart. Proceed?`
      );
      if (confirmChange) {
        setCart([]);
        setSelectedDateState(date);
      }
    } else {
      setSelectedDateState(date);
    }
  };

  const addToCart = (
    food: FoodItem, 
    quantity: number = 1, 
    customPrice?: number, 
    customUnit?: string
  ) => {
    const price = customPrice !== undefined ? customPrice : food.price;
    const unit = customUnit || food.unit;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.foodItemId === food.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        
        // Check max order limit
        if (food.maxOrderQty && newQty > food.maxOrderQty) {
          alert(`Maximum allowed limit for ${food.name} is ${food.maxOrderQty} portions.`);
          return prev;
        }

        updated[existingIndex].quantity = newQty;
        updated[existingIndex].itemTotal = updated[existingIndex].quantity * price;
        return updated;
      } else {
        const newItem: OrderItem = {
          foodItemId: food.id,
          name: food.name,
          teluguName: food.teluguName,
          price,
          unit,
          quantity,
          itemTotal: quantity * price,
          imageUrl: food.imageUrl,
          isVeg: food.isVeg,
          spiceLevel: food.spiceLevel,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (foodItemId: string) => {
    setCart((prev) => prev.filter((item) => item.foodItemId !== foodItemId));
  };

  const updateQuantity = (foodItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(foodItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.foodItemId === foodItemId) {
          return {
            ...item,
            quantity: newQty,
            itemTotal: newQty * item.price,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo('');
    setDiscountAmount(0);
    localStorage.removeItem('vindu_cart');
  };

  const applyPromo = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'VINDU10' || clean === 'ANDHRA10') {
      setAppliedPromo(clean);
      setDiscountAmount(0.1); // 10% off
      return true;
    } else if (clean === 'FIRSTFEAST' || clean === 'AMMA50') {
      setAppliedPromo(clean);
      setDiscountAmount(50); // ₹50 flat off
      return true;
    }
    return false;
  };

  const removePromo = () => {
    setAppliedPromo('');
    setDiscountAmount(0);
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  
  const freeThresh = settings?.freeDeliveryThreshold || 600;
  const baseDelivery = settings?.deliveryFee || 40;
  const deliveryFee = subtotal >= freeThresh || subtotal === 0 ? 0 : baseDelivery;
  const packagingFee = subtotal > 0 ? (settings?.packagingFee || 20) : 0;

  let calculatedDiscount = 0;
  if (discountAmount > 0) {
    if (discountAmount < 1) {
      // percentage
      calculatedDiscount = Math.round(subtotal * discountAmount);
    } else {
      // flat
      calculatedDiscount = Math.min(discountAmount, subtotal);
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + packagingFee - calculatedDiscount);

  return (
    <CartContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
        deliveryFee,
        packagingFee,
        discount: calculatedDiscount,
        appliedPromo,
        applyPromo,
        removePromo,
        total,
        settings,
        refreshSettings: fetchSettings,
        isTrackModalOpen,
        setIsTrackModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
