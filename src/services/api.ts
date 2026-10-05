import { FoodItem, DayMenu, Order, OrderStatus, DashboardOverview, KitchenSettings, ItemStatus } from '@/types';

// Standard API Client for Frontend Communication with Backend
export const api = {
  // Menu APIs
  async getMenu(date?: string): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    try {
      const url = date ? `/api/menu?date=${encodeURIComponent(date)}` : '/api/menu';
      const res = await fetch(url, { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateMenu(payload: {
    date: string;
    title?: string;
    note?: string;
    isPublished?: boolean;
    isAcceptingOrders?: boolean;
    cutoffTime?: string;
    items?: any[];
  }): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async publishMenu(date: string, isPublished: boolean): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    return this.updateMenu({ date, isPublished });
  },

  async toggleMenuAcceptingOrders(date: string, isAcceptingOrders: boolean): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    return this.updateMenu({ date, isAcceptingOrders });
  },

  async updateStock(date: string, foodItemId: string, delta: number): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    const current = await this.getMenu(date);
    if (!current.success || !current.data) return { success: false, error: 'Menu not found' };
    const items = (current.data as any).items || [];
    const item = items.find((i: any) => (i.food_item_id || i.foodItemId) === foodItemId);
    const currStock = item ? (item.remaining_stock !== undefined ? item.remaining_stock : item.remainingStock) : 10;
    const newStock = Math.max(0, currStock + delta);
    return this.updateMenu({
      date,
      items: [{ foodItemId, remainingStock: newStock }],
    });
  },

  async updateItemStatus(date: string, foodItemId: string, status: ItemStatus): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    return this.updateMenu({
      date,
      items: [{ foodItemId, status, remainingStock: status === 'SOLD_OUT' ? 0 : 15 }],
    });
  },

  async removeItemFromMenu(date: string, foodItemId: string): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    return this.updateMenu({
      date,
      items: [{ foodItemId, status: 'HIDDEN' as ItemStatus, remainingStock: 0 }],
    });
  },

  async addItemToMenu(date: string, item: { foodItemId: string; availableQuantity: number; priceOverride?: number }): Promise<{ success: boolean; data?: DayMenu; error?: string }> {
    return this.updateMenu({
      date,
      items: [{ foodItemId: item.foodItemId, remainingStock: item.availableQuantity, status: 'AVAILABLE' }],
    });
  },

  async duplicateMenu(sourceDate: string, targetDate: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/menu/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDate, targetDate }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  // Food Items Catalog APIs
  async getFoodItems(): Promise<{ success: boolean; data?: FoodItem[]; error?: string }> {
    try {
      const res = await fetch('/api/items', { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async createFoodItem(item: Partial<FoodItem>): Promise<{ success: boolean; data?: FoodItem; error?: string }> {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<{ success: boolean; data?: FoodItem; error?: string }> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async deleteFoodItem(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  // Orders APIs
  async getOrders(filters?: { date?: string; status?: string; phone?: string }): Promise<{ success: boolean; data?: Order[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.set('date', filters.date);
      if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters?.phone) params.set('phone', filters.phone);

      const res = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async getOrderById(id: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async createOrder(orderData: any): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  // Payment APIs
  async createPaymentOrder(amount: number, metadata?: any): Promise<{ success: boolean; orderId?: string; amount?: number; currency?: string; error?: string }> {
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', notes: metadata }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<{ success: boolean; verified?: boolean; error?: string }> {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  // Admin & Settings APIs
  async adminLogin(username: string, password: string): Promise<{ success: boolean; data?: { token: string; name: string }; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async getAdminStats(): Promise<{ success: boolean; data?: DashboardOverview; error?: string }> {
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async getSettings(): Promise<{ success: boolean; data?: { settings: KitchenSettings; categories: string[]; units: string[] }; error?: string }> {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateSettings(settings: Partial<KitchenSettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },
};
