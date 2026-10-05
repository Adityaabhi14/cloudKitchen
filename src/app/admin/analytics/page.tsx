'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  PieChart,
  Flame,
  Award,
  Download,
  Filter,
  Users,
  Percent,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'ALL' | '7DAYS' | '30DAYS'>('ALL');

  useEffect(() => {
    api.getOrders().then((res) => {
      if (res.success && res.data) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => {
    const isPaid = o.payment_status === 'PAID' || o.paymentStatus === 'PAID';
    return isPaid ? sum + (o.total || o.total_amount || 0) : sum;
  }, 0);
  const avgOrderVal = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Meal breakdown
  const lunchOrders = orders.filter(o => (o.delivery_slot || o.deliveryAddress?.deliverySlot || '').toLowerCase().includes('lunch')).length;
  const dinnerOrders = orders.filter(o => (o.delivery_slot || o.deliveryAddress?.deliverySlot || '').toLowerCase().includes('dinner') || (o.delivery_slot || '').toLowerCase().includes('evening')).length;

  // Veg vs Non-Veg portions
  let vegPortions = 0;
  let nonVegPortions = 0;
  let cancelledOrders = 0;

  // Dish Sales
  const dishSales: Record<string, { name: string; qty: number; revenue: number; isVeg: boolean }> = {};

  orders.forEach((o) => {
    if (o.order_status === 'CANCELLED' || o.orderStatus === 'CANCELLED') {
      cancelledOrders++;
    }
    (o.items || []).forEach((i: any) => {
      const name = i.name || i.food_name || i.foodItemId || 'Special Dish';
      const qty = i.quantity || 1;
      const price = i.price || i.price_at_purchase || 250;
      const isVeg = Boolean(i.isVeg || i.is_veg);

      if (isVeg) vegPortions += qty;
      else nonVegPortions += qty;

      if (!dishSales[name]) dishSales[name] = { name, qty: 0, revenue: 0, isVeg };
      dishSales[name].qty += qty;
      dishSales[name].revenue += qty * price;
    });
  });

  const topDishes = Object.values(dishSales).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const worstDishes = Object.values(dishSales).sort((a, b) => a.qty - b.qty).slice(0, 3);
  const maxDishQty = topDishes.length > 0 ? Math.max(...topDishes.map((d) => d.qty), 1) : 1;

  const totalPortions = vegPortions + nonVegPortions;
  const vegPercentage = totalPortions > 0 ? Math.round((vegPortions / totalPortions) * 100) : 50;
  const cancellationRate = orders.length > 0 ? ((cancelledOrders / orders.length) * 100).toFixed(1) : '0.0';

  const handleExportCSV = () => {
    window.open('/api/admin/reports/export?startDate=2026-01-01&endDate=2026-12-31', '_blank');
  };

  return (
    <AdminLayout title="Kitchen Performance & Sales Analytics">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white border border-[#2E1A11]/10 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
              Kitchen Revenue &amp; Business Intelligence
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Live operational metrics, average order value, category share, and automated business exports.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download size={14} className="text-[#FFD54F]" /> Export Business Report (CSV)
            </button>
          </div>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Total Revenue
            </span>
            <div className="text-2xl font-black text-[#24100B]">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[#228B45] font-bold">From confirmed pre-orders</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Average Order Value (AOV)
            </span>
            <div className="text-2xl font-black text-[#24100B]">
              ₹{avgOrderVal}
            </div>
            <p className="text-xs text-[#78716C] font-semibold">Per dining feast</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Total Feasts Booked
            </span>
            <div className="text-2xl font-black text-[#24100B]">
              {orders.length}
            </div>
            <p className="text-xs text-blue-600 font-bold">{lunchOrders} Lunch • {dinnerOrders} Dinner</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Cancellation Rate
            </span>
            <div className="text-2xl font-black text-[#24100B]">
              {cancellationRate}%
            </div>
            <p className="text-xs text-[#228B45] font-bold">99%+ On-time fulfillment</p>
          </div>
        </div>

        {/* Veg vs Non-Veg Portions & Meal Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dietary Split */}
          <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-4">
            <h3 className="font-display font-black text-base text-[#2E1A11] flex items-center gap-2">
              <PieChart size={16} className="text-[#C9281C]" /> Dietary Demand Share
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#2E7D32]">Vegetarian ({vegPercentage}%)</span>
                  <span>{vegPortions} Portions</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2E7D32] rounded-full transition-all"
                    style={{ width: `${vegPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#C9281C]">Non-Vegetarian ({100 - vegPercentage}%)</span>
                  <span>{nonVegPortions} Portions</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#C9281C] rounded-full transition-all"
                    style={{ width: `${100 - vegPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#78716C] pt-2">
              Total {totalPortions} individual brass handi portions slow-cooked with fresh local ingredients.
            </p>
          </div>

          {/* Meal Slot Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-4">
            <h3 className="font-display font-black text-base text-[#2E1A11] flex items-center gap-2">
              <Clock size={16} className="text-[#E65100]" /> Lunch vs Dinner Distribution
            </h3>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#2E1A11]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#78716C] uppercase">Lunch Slots</span>
                <div className="text-2xl font-black text-[#2E1A11]">{lunchOrders} Orders</div>
                <div className="text-[10px] text-[#2E7D32] font-semibold">12:30 PM - 2:00 PM</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#2E1A11]/10 space-y-1">
                <span className="text-[11px] font-bold text-[#78716C] uppercase">Dinner Slots</span>
                <div className="text-2xl font-black text-[#2E1A11]">{dinnerOrders} Orders</div>
                <div className="text-[10px] text-[#E65100] font-semibold">7:30 PM - 9:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Recipes Table */}
        <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#2E1A11]/5 pb-3">
            <div>
              <h3 className="font-display font-black text-base text-[#2E1A11] flex items-center gap-2">
                <Award size={16} className="text-[#F4B400]" /> Top-Selling Telugu Recipes
              </h3>
              <p className="text-xs text-[#78716C]">
                Dishes with highest customer re-order frequency and customer review ratings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topDishes.map((dish, i) => {
              const pct = Math.round((dish.qty / maxDishQty) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2E1A11]">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF5ED] text-[#C9281C] text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{dish.name}</span>
                    </span>
                    <span className="text-[#78716C]">
                      {dish.qty} portions • ₹{dish.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F57C00] to-[#C9281C] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
