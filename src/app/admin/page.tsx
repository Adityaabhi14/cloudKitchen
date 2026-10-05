'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { DashboardOverview, Order, OrderStatus } from '@/types';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CalendarDays,
  Flame,
  IndianRupee,
  Bike,
  Utensils,
  ChevronRight,
  Layers,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Leaf,
  Drumstick,
} from 'lucide-react';

const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  PENDING:          { bg: 'bg-[#F4B400]/15', text: 'text-[#B45309]', border: 'border-[#F4B400]/30' },
  CONFIRMED:        { bg: 'bg-[#F57C00]/15', text: 'text-[#C2410C]', border: 'border-[#F57C00]/30' },
  PREPARING:        { bg: 'bg-[#C9281C]/15', text: 'text-[#C9281C]', border: 'border-[#C9281C]/30' },
  READY:            { bg: 'bg-[#228B45]/15', text: 'text-[#228B45]', border: 'border-[#228B45]/30' },
  OUT_FOR_DELIVERY: { bg: 'bg-blue-500/15',  text: 'text-blue-600',   border: 'border-blue-500/30' },
  DELIVERED:        { bg: 'bg-[#228B45]/15', text: 'text-[#166534]', border: 'border-[#228B45]/30' },
  CANCELLED:        { bg: 'bg-gray-200',     text: 'text-gray-600',   border: 'border-gray-300' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [operationsSummary, setOperationsSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'kanban'>('overview');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, menuRes, settingsRes, opsRes] = await Promise.all([
        api.getAdminStats(),
        api.getOrders(),
        api.getMenu(tomorrowStr),
        api.getSettings(),
        fetch(`/api/admin/operations?date=${tomorrowStr}`).then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
      if (menuRes.success && menuRes.data) setMenuData(menuRes.data);
      if (settingsRes.success && settingsRes.data?.settings) setSettings(settingsRes.data.settings);
      if (opsRes.success && opsRes.data) {
        setOperationsSummary(opsRes.data.summary);
        setAlerts(opsRes.data.alerts || []);
      }
      setLastSync(new Date());
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, [tomorrowStr]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setIsUpdatingStatus(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await load();
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Metric aggregates
  const todayOrders = orders.filter((o) => ((o as any).menu_date || o.menuDate) === todayStr);
  const tomorrowOrders = orders.filter((o) => ((o as any).menu_date || o.menuDate) === tomorrowStr && ((o as any).order_status || o.orderStatus) !== 'CANCELLED');

  const totalRevenue = orders.reduce((sum, o) => {
    const isPaid = (o as any).payment_status === 'PAID' || o.paymentStatus === 'PAID';
    return isPaid ? sum + (o.total || (o as any).total_amount || 0) : sum;
  }, 0);

  const pendingCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'PENDING').length;
  const confirmedCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'CONFIRMED').length;
  const preparingCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'PREPARING').length;
  const readyCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'READY').length;
  const deliveryCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter(o => ((o as any).order_status || o.orderStatus) === 'DELIVERED').length;

  // Portion calculations
  let totalTomorrowPortions = 0;
  let vegPortions = 0;
  let nonVegPortions = 0;

  for (const ord of tomorrowOrders) {
    const items = ord.items || [];
    for (const it of items) {
      const q = it.quantity || 1;
      totalTomorrowPortions += q;
      if (it.isVeg || (it as any).is_veg) vegPortions += q;
      else nonVegPortions += q;
    }
  }

  // Kanban groups
  const kanbanColumns: { key: OrderStatus; label: string; bg: string; border: string; orders: Order[] }[] = [
    {
      key: 'PENDING',
      label: 'NEW / PENDING',
      bg: 'bg-[#FFF8E1]',
      border: 'border-[#FFECB3]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'PENDING'),
    },
    {
      key: 'CONFIRMED',
      label: 'CONFIRMED',
      bg: 'bg-[#FFF3E0]',
      border: 'border-[#FFE0B2]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'CONFIRMED'),
    },
    {
      key: 'PREPARING',
      label: 'IN HANDI PREP',
      bg: 'bg-[#FFEBEE]',
      border: 'border-[#FFCDD2]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'PREPARING'),
    },
    {
      key: 'READY',
      label: 'READY FOR DISPATCH',
      bg: 'bg-[#E8F5E9]',
      border: 'border-[#C8E6C9]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'READY'),
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'OUT FOR DELIVERY',
      bg: 'bg-[#E3F2FD]',
      border: 'border-[#BBDEFB]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'OUT_FOR_DELIVERY'),
    },
    {
      key: 'DELIVERED',
      label: 'DELIVERED',
      bg: 'bg-[#F1F8E9]',
      border: 'border-[#DCEDC8]',
      orders: orders.filter(o => ((o as any).order_status || o.orderStatus) === 'DELIVERED').slice(0, 10),
    },
  ];

  return (
    <AdminLayout title="Vindu Ruchulu Kitchen Control Center">
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#24100B] font-display">
                Kitchen Control Center 👨‍🍳
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#2E7D32]/15 text-[#2E7D32] border border-[#2E7D32]/30">
                Live Kitchen Active
              </span>
            </div>
            <p className="text-xs text-[#78716C] font-semibold">
              Telangana & Andhra Daily Pre-orders • Last Synced: {lastSync.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-[#FAF5ED] p-1 rounded-xl border border-[#2E1A11]/10">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'overview'
                    ? 'bg-[#C9281C] text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#2E1A11]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-[#C9281C] text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#2E1A11]'
                }`}
              >
                <Layers size={13} /> Kitchen Kanban
              </button>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#2E1A11]/10 bg-white hover:bg-[#FAF5ED] text-[#2E1A11] transition-colors"
              title="Refresh Kitchen Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#C9281C]' : ''} />
            </button>
          </div>
        </div>

        {/* Real-time Alerts Ribbon */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-xs ${
                  alt.type === 'URGENT'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : alt.type === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <Bell size={16} className="shrink-0" />
                <div className="flex-1">
                  <div className="font-bold">{alt.title}</div>
                  <div className="text-[11px] opacity-90">{alt.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEATURE 1: TODAY'S & TOMORROW'S KITCHEN OPERATIONS SUMMARY */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#78716C] flex items-center gap-2">
              <Flame size={15} className="text-[#C9281C]" />
              Today &amp; Tomorrow Kitchen Operations
            </h3>
            <span className="text-xs font-bold text-[#C9281C]">
              Target Date: {tomorrowStr}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Total Tomorrow Pre-Orders */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>Tomorrow Orders</span>
                <CalendarDays size={13} className="text-[#C9281C]" />
              </div>
              <div className="text-2xl font-black text-[#2E1A11]">
                {operationsSummary?.totalOrders ?? tomorrowOrders.length}
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold">
                {operationsSummary?.lunchOrders ?? 0} Lunch • {operationsSummary?.dinnerOrders ?? 0} Dinner
              </div>
            </div>

            {/* 2. Total Portions Needed */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>Total Portions</span>
                <Utensils size={13} className="text-[#E65100]" />
              </div>
              <div className="text-2xl font-black text-[#E65100]">
                {operationsSummary?.totalPortions ?? totalTomorrowPortions}
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold flex items-center gap-1.5">
                <span className="text-[#2E7D32]">🟢 {operationsSummary?.vegPortions ?? vegPortions} Veg</span>
                <span>•</span>
                <span className="text-[#C9281C]">🔴 {operationsSummary?.nonVegPortions ?? nonVegPortions} Non-Veg</span>
              </div>
            </div>

            {/* 3. In Prep */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>In Preparation</span>
                <Flame size={13} className="text-[#C9281C]" />
              </div>
              <div className="text-2xl font-black text-[#C9281C]">
                {preparingCount + confirmedCount}
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold">
                {preparingCount} in handi • {confirmedCount} confirmed
              </div>
            </div>

            {/* 4. Ready to Dispatch */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>Ready Orders</span>
                <CheckCircle2 size={13} className="text-[#2E7D32]" />
              </div>
              <div className="text-2xl font-black text-[#2E7D32]">
                {readyCount}
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold">
                Packed in handi boxes
              </div>
            </div>

            {/* 5. Out For Delivery */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>Out for Delivery</span>
                <Bike size={13} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">
                {deliveryCount}
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold">
                Active rider transit
              </div>
            </div>

            {/* 6. Total Revenue */}
            <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                <span>Revenue</span>
                <IndianRupee size={13} className="text-[#2E7D32]" />
              </div>
              <div className="text-2xl font-black text-[#2E1A11]">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#2E7D32] font-semibold">
                {deliveredCount} delivered so far
              </div>
            </div>
          </div>
        </section>

        {/* VIEW 1: KANBAN PREPARATION BOARD (FEATURE 2) */}
        {viewMode === 'kanban' && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-lg text-[#2E1A11]">
                  Kitchen Preparation Kanban Board
                </h3>
                <p className="text-xs text-[#78716C]">
                  Move orders through preparation stages. Updates live customer tracking immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
              {kanbanColumns.map((col) => (
                <div
                  key={col.key}
                  className={`rounded-2xl ${col.bg} border ${col.border} p-3 flex flex-col min-w-[220px] max-h-[700px] overflow-y-auto`}
                >
                  <div className="flex items-center justify-between font-black text-xs text-[#2E1A11] pb-2 border-b border-[#2E1A11]/10 mb-3">
                    <span>{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#C9281C] text-[10px] font-black shadow-xs">
                      {col.orders.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {col.orders.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-[#78716C] font-semibold italic">
                        No orders in this stage
                      </div>
                    ) : (
                      col.orders.map((ord) => {
                        const orderNum = ord.orderNumber || (ord as any).order_number;
                        const items = ord.items || [];
                        const isUpdating = isUpdatingStatus === ord.id;

                        return (
                          <div
                            key={ord.id}
                            className="p-3 bg-white rounded-xl border border-[#2E1A11]/10 shadow-xs space-y-2 text-xs hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-[#2E1A11]">#{orderNum}</span>
                              <span className="font-black text-[#C9281C]">
                                ₹{ord.total || (ord as any).total_amount}
                              </span>
                            </div>

                            <div className="text-[11px] text-[#78716C]">
                              <div className="font-bold text-[#2E1A11] truncate">{ord.customer?.name || (ord as any).customer_name}</div>
                              <div className="text-[10px]">{ord.deliveryAddress?.deliverySlot || (ord as any).delivery_slot}</div>
                            </div>

                            <div className="text-[11px] font-medium text-[#2E1A11] space-y-0.5 border-t border-[#2E1A11]/5 pt-1.5">
                              {items.map((it, i) => (
                                <div key={i} className="flex justify-between">
                                  <span className="truncate">{it.quantity}x {it.name || (it as any).food_name}</span>
                                </div>
                              ))}
                            </div>

                            {/* Action Buttons for Stage Advancement */}
                            <div className="pt-2 border-t border-[#2E1A11]/5">
                              {col.key === 'PENDING' && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, 'CONFIRMED')}
                                  disabled={isUpdating}
                                  className="w-full py-1.5 rounded-lg bg-[#F57C00] hover:bg-[#E65100] text-white text-[11px] font-bold transition-colors"
                                >
                                  {isUpdating ? 'Updating...' : 'Confirm Order →'}
                                </button>
                              )}
                              {col.key === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, 'PREPARING')}
                                  disabled={isUpdating}
                                  className="w-full py-1.5 rounded-lg bg-[#C9281C] hover:bg-[#A31F16] text-white text-[11px] font-bold transition-colors"
                                >
                                  {isUpdating ? 'Updating...' : 'Start Handi Prep →'}
                                </button>
                              )}
                              {col.key === 'PREPARING' && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, 'READY')}
                                  disabled={isUpdating}
                                  className="w-full py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[11px] font-bold transition-colors"
                                >
                                  {isUpdating ? 'Updating...' : 'Mark Packed & Ready →'}
                                </button>
                              )}
                              {col.key === 'READY' && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, 'OUT_FOR_DELIVERY')}
                                  disabled={isUpdating}
                                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
                                >
                                  {isUpdating ? 'Updating...' : 'Dispatch with Rider →'}
                                </button>
                              )}
                              {col.key === 'OUT_FOR_DELIVERY' && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, 'DELIVERED')}
                                  disabled={isUpdating}
                                  className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors"
                                >
                                  {isUpdating ? 'Updating...' : 'Mark Delivered ✓'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 2: OVERVIEW TABLES & ACTION PANELS */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left 2 Cols: Recent Active Orders */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#2E1A11]/5 pb-3">
                  <div>
                    <h3 className="font-display font-black text-base text-[#2E1A11]">
                      Recent Customer Feasts
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Latest pre-orders requiring batch cooking and delivery dispatch.
                    </p>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-bold text-[#C9281C] hover:underline flex items-center gap-1"
                  >
                    View All Orders →
                  </Link>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 6).map((ord) => {
                    const orderNum = ord.orderNumber || (ord as any).order_number;
                    const items = ord.items || [];

                    return (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-[#FAF5ED] border border-[#2E1A11]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#2E1A11]">#{orderNum}</span>
                            <StatusBadge status={ord.orderStatus || (ord as any).order_status} />
                            <span className="text-[10px] text-[#78716C] font-semibold">
                              {ord.menuDate || (ord as any).menu_date}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-[#35170F]">
                            {ord.customer?.name || (ord as any).customer_name} •{' '}
                            <span className="text-[#78716C] font-normal">{ord.deliveryAddress?.deliverySlot || (ord as any).delivery_slot}</span>
                          </div>
                          <div className="text-[11px] text-[#78716C] line-clamp-1">
                            {items.map(i => `${i.quantity}x ${i.name || (i as any).food_name}`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-black text-sm text-[#2E1A11]">
                            ₹{ord.total || (ord as any).total_amount}
                          </span>
                          <button
                            onClick={() => {
                              const cur = ord.orderStatus || (ord as any).order_status;
                              if (cur === 'PENDING') handleStatusChange(ord.id, 'CONFIRMED');
                              else if (cur === 'CONFIRMED') handleStatusChange(ord.id, 'PREPARING');
                              else if (cur === 'PREPARING') handleStatusChange(ord.id, 'READY');
                              else if (cur === 'READY') handleStatusChange(ord.id, 'OUT_FOR_DELIVERY');
                              else if (cur === 'OUT_FOR_DELIVERY') handleStatusChange(ord.id, 'DELIVERED');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-white font-bold text-[11px] transition-colors"
                          >
                            Advance Status →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Quick Operational Links & Menu Planner Shortcuts */}
            <div className="space-y-6">
              {/* Menu Status Widget */}
              <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-base text-[#2E1A11]">
                    Tomorrow&apos;s Menu Status
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {menuData?.menu?.status || 'PUBLISHED'}
                  </span>
                </div>

                <p className="text-xs text-[#78716C]">
                  {menuData?.items?.length || 0} traditional recipes scheduled with stone-ground spices.
                </p>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/admin/menu"
                    className="w-full py-2.5 rounded-xl bg-[#C9281C] hover:bg-[#A31F16] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#C9281C]/20"
                  >
                    <CalendarDays size={14} /> Open Menu Planner
                  </Link>
                  <Link
                    href="/admin/payments"
                    className="w-full py-2.5 rounded-xl bg-[#FAF5ED] hover:bg-[#F0E6D6] border border-[#2E1A11]/15 text-[#35170F] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <IndianRupee size={14} /> Payment Transactions
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="w-full py-2.5 rounded-xl bg-[#FAF5ED] hover:bg-[#F0E6D6] border border-[#2E1A11]/15 text-[#35170F] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <TrendingUp size={14} /> Reports &amp; CSV Export
                  </Link>
                </div>
              </div>

              {/* Delivery Zone Summary */}
              <div className="p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-3">
                <h3 className="font-display font-black text-sm text-[#2E1A11]">
                  Active Delivery Slots
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF5ED] flex items-center justify-between">
                    <span className="font-bold text-[#35170F]">Lunch (12:30 PM - 2:00 PM)</span>
                    <span className="text-[11px] font-bold text-[#2E7D32]">Active</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF5ED] flex items-center justify-between">
                    <span className="font-bold text-[#35170F]">Dinner (7:30 PM - 9:00 PM)</span>
                    <span className="text-[11px] font-bold text-[#2E7D32]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
