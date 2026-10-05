'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { DayMenu, FoodItem, ItemStatus } from '@/types';
import {
  CalendarDays,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  X,
  Utensils,
  Search,
  Sparkles,
  Copy,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function addDays(d: Date, n: number) {
  const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd;
}
function friendlyDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface MenuItemRowProps {
  menuItem: any;
  foodItem: FoodItem | undefined;
  onStockChange: (foodItemId: string, delta: number) => void;
  onToggleSoldOut: (foodItemId: string, currentStatus: ItemStatus) => void;
  onRemove: (foodItemId: string) => void;
}

function MenuItemRow({ menuItem, foodItem, onStockChange, onToggleSoldOut, onRemove }: MenuItemRowProps) {
  const fid    = menuItem.food_item_id || menuItem.foodItemId;
  const stock  = menuItem.remaining_stock !== undefined ? menuItem.remaining_stock : (menuItem.remainingStock ?? 0);
  const capacity = menuItem.available_quantity || menuItem.availableQuantity || 25;
  const status = menuItem.status as ItemStatus;
  const name   = foodItem?.name || fid;
  const isVeg  = Boolean(foodItem?.isVeg || (foodItem as any)?.is_veg);

  return (
    <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-[rgba(53,23,15,0.1)] group hover:border-[#F57C00] transition-colors shadow-xs">
      {/* Veg indicator */}
      <div className="flex-shrink-0">
        {isVeg ? <span className="veg-dot" /> : <span className="nonveg-dot" />}
      </div>

      {/* Name and Category */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-[#24100B] truncate">{name}</p>
        {foodItem && (
          <p className="text-[11px] text-[#6E5147] truncate">
            {foodItem.category || (foodItem as any).category_name} · ₹{menuItem.price_override || foodItem.price || (foodItem as any).base_price} / {menuItem.unit_override || foodItem.unit || (foodItem as any).default_unit}
          </p>
        )}
      </div>

      {/* Portion Stock Capacity Breakdown */}
      <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-[#78716C]">
        <span>Capacity: {capacity}</span>
        <span>•</span>
        <span className={stock <= 5 ? 'text-[#C9281C] font-bold' : 'text-[#2E7D32] font-bold'}>
          {stock} Remaining
        </span>
      </div>

      {/* Status badge */}
      <span className={`badge text-[10px] ${
        status === 'AVAILABLE'  ? 'badge-published' :
        status === 'LOW_STOCK'  ? 'badge-pending' :
        status === 'SOLD_OUT'   ? 'badge-cancelled' : 'badge-draft'
      }`}>
        {status}
      </span>

      {/* Stock controls */}
      <div className="flex items-center gap-1 bg-[#FFF8EE] border border-[rgba(53,23,15,0.1)] rounded-xl p-0.5">
        <button
          type="button"
          onClick={() => onStockChange(fid, -1)}
          disabled={stock <= 0}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#24100B] hover:bg-white disabled:opacity-30 transition-colors"
          title="Decrease stock portion"
        >
          <Minus size={11} />
        </button>
        <span className="w-7 text-center text-xs font-bold text-[#24100B]">{stock}</span>
        <button
          type="button"
          onClick={() => onStockChange(fid, 1)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#24100B] hover:bg-white transition-colors"
          title="Increase stock portion"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Toggle sold out */}
      <button
        type="button"
        onClick={() => onToggleSoldOut(fid, status)}
        className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-colors ${
          status === 'SOLD_OUT'
            ? 'bg-[#228B45]/15 text-[#228B45] border-[#228B45]/30 hover:bg-[#228B45]/25'
            : 'bg-white text-[#6E5147] border-[rgba(53,23,15,0.15)] hover:text-[#C9281C] hover:border-[#C9281C]'
        }`}
        title={status === 'SOLD_OUT' ? 'Mark Available' : 'Mark Sold Out'}
      >
        {status === 'SOLD_OUT' ? 'Make Available' : 'Sold Out'}
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(fid)}
        className="p-1.5 rounded-lg text-[#6E5147] hover:text-[#C9281C] hover:bg-[#C9281C]/10 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove item from this date"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function AdminMenuPage() {
  const tomorrowStr = formatDate(addDays(new Date(), 1));
  const todayStr = formatDate(new Date());

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [dayMenu,      setDayMenu]      = useState<DayMenu | null>(null);
  const [catalog,      setCatalog]      = useState<FoodItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [feedback,     setFeedback]     = useState('');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [cutoffTime,   setCutoffTime]   = useState('11:00 PM');

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const load = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const [menuRes, itemsRes] = await Promise.all([
        api.getMenu(date),
        api.getFoodItems(),
      ]);
      if (menuRes.success && menuRes.data) {
        setDayMenu(menuRes.data);
        if (menuRes.data.cutoffTime) setCutoffTime(menuRes.data.cutoffTime);
      }
      if (itemsRes.success && itemsRes.data) setCatalog(itemsRes.data);
    } catch (e) {
      console.error('Failed to load menu data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedDate);
  }, [load, selectedDate]);

  const dates = Array.from({ length: 7 }).map((_, i) => formatDate(addDays(new Date(), i)));

  const handleStockChange = async (foodItemId: string, delta: number) => {
    await api.updateStock(selectedDate, foodItemId, delta);
    load(selectedDate);
  };

  const handleToggleSoldOut = async (foodItemId: string, currentStatus: ItemStatus) => {
    const nextStatus: ItemStatus = currentStatus === 'SOLD_OUT' ? 'AVAILABLE' : 'SOLD_OUT';
    await api.updateItemStatus(selectedDate, foodItemId, nextStatus);
    load(selectedDate);
  };

  const handleRemove = async (foodItemId: string) => {
    await api.removeItemFromMenu(selectedDate, foodItemId);
    load(selectedDate);
  };

  const handleTogglePublish = async () => {
    if (!dayMenu) return;
    const isPub = !dayMenu.isPublished;
    await api.publishMenu(selectedDate, isPub);
    toast(isPub ? '✅ Menu Published Live to Customer Website' : 'Menu set to Draft mode');
    load(selectedDate);
  };

  const handleToggleAcceptingOrders = async () => {
    if (!dayMenu) return;
    const isAcc = !dayMenu.isAcceptingOrders;
    await api.toggleMenuAcceptingOrders(selectedDate, isAcc);
    toast(isAcc ? '🟢 Now accepting customer pre-orders' : '🔴 Pre-ordering closed for this date');
    load(selectedDate);
  };

  const handleAddItem = async (item: FoodItem) => {
    await api.addItemToMenu(selectedDate, {
      foodItemId: item.id,
      availableQuantity: item.availableQuantity || 25,
      priceOverride: item.price,
    });
    toast(`Added ${item.name} to menu`);
    load(selectedDate);
  };

  const handleDuplicateFromDate = async (sourceDate: string) => {
    const res = await api.duplicateMenu(sourceDate, selectedDate);
    if (res.success) {
      toast(`✅ Successfully copied menu from ${friendlyDate(sourceDate)} to ${friendlyDate(selectedDate)}!`);
      load(selectedDate);
    }
  };

  const menuItems = (dayMenu as any)?.items || [];
  const currentFids = new Set(menuItems.map((m: any) => m.food_item_id || m.foodItemId));

  // Portions summary
  const totalCapacity = menuItems.reduce((s: number, i: any) => s + (i.available_quantity || i.availableQuantity || 25), 0);
  const totalRemaining = menuItems.reduce((s: number, i: any) => s + (i.remaining_stock !== undefined ? i.remaining_stock : (i.remainingStock ?? 0)), 0);
  const soldOutItems = menuItems.filter((i: any) => i.status === 'SOLD_OUT' || i.remaining_stock <= 0).length;
  const lowStockItems = menuItems.filter((i: any) => i.status === 'LOW_STOCK' || (i.remaining_stock > 0 && i.remaining_stock <= 5)).length;

  return (
    <AdminLayout title="Daily Menu Planner">
      {feedback && (
        <div className="toast">
          <CheckCircle2 size={16} className="text-[#228B45]" />
          <span className="text-[#24100B] text-xs font-bold">{feedback}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
              Next-Day Menu Planner &amp; Portion Controls
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Plan daily brass handi feasts, duplicate proven menus, set order cutoff times &amp; prevent overselling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => load(selectedDate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[rgba(53,23,15,0.15)] bg-white text-xs font-semibold text-[#24100B] hover:border-[#C9281C] transition-colors shadow-xs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Date Selector Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap btn-tactile ${
                selectedDate === d
                  ? 'bg-[#24100B] text-[#FFF8EE] shadow-md'
                  : 'bg-white text-[#6E5147] border border-[rgba(53,23,15,0.1)] hover:text-[#24100B] hover:bg-[#FFF8EE]'
              }`}
            >
              {friendlyDate(d)}
              {d === tomorrowStr && (
                <span className="ml-1.5 text-[10px] text-[#F4B400] uppercase font-black tracking-wider">(Tomorrow)</span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Menu Duplication Toolbar (FEATURE 3) */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#2E1A11]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#35170F]">
            <Copy size={15} className="text-[#C9281C]" />
            <span>Duplicate Previous Menu:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDuplicateFromDate(todayStr)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF5ED] hover:bg-[#FFF3E0] border border-[#2E1A11]/10 text-xs font-bold text-[#2E1A11] transition-colors"
            >
              Copy Today&apos;s Menu
            </button>
            <button
              onClick={() => {
                const lastWeek = new Date(selectedDate + 'T00:00:00');
                lastWeek.setDate(lastWeek.getDate() - 7);
                handleDuplicateFromDate(formatDate(lastWeek));
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FAF5ED] hover:bg-[#FFF3E0] border border-[#2E1A11]/10 text-xs font-bold text-[#C9281C] transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} />
              Copy Last Week&apos;s Same Day
            </button>
          </div>
        </div>

        {/* Portion Capacity & Stock Health Bar (FEATURE 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-0.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Scheduled Dishes</span>
            <div className="text-xl font-black text-[#2E1A11]">{menuItems.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-0.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Total Capacity</span>
            <div className="text-xl font-black text-[#E65100]">{totalCapacity} Portions</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-0.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Remaining Stock</span>
            <div className="text-xl font-black text-[#2E7D32]">{totalRemaining} Portions</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-0.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Sold Out / Low Stock</span>
            <div className="text-xl font-black text-[#C9281C]">
              {soldOutItems} Sold Out • {lowStockItems} Low
            </div>
          </div>
        </div>

        {/* Day Menu Status & Control Bar */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className={`badge ${dayMenu?.isPublished ? 'badge-published' : 'badge-draft'}`}>
              {dayMenu?.isPublished ? 'Published Live' : 'Draft Mode'}
            </span>
            <span className="text-xs font-bold text-[#24100B]">
              {menuItems.length} Dishes Scheduled for {friendlyDate(selectedDate)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAcceptingOrders}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                dayMenu?.isAcceptingOrders
                  ? 'bg-[#228B45]/15 text-[#228B45] border-[#228B45]/30 hover:bg-[#228B45]/25'
                  : 'bg-[#E33B24]/15 text-[#E33B24] border-[#E33B24]/30 hover:bg-[#E33B24]/25'
              }`}
            >
              {dayMenu?.isAcceptingOrders ? '🟢 Orders Open' : '🔴 Orders Closed'}
            </button>

            <button
              type="button"
              onClick={handleTogglePublish}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-colors ${
                dayMenu?.isPublished
                  ? 'bg-white text-[#24100B] border-[rgba(53,23,15,0.2)] hover:border-[#C9281C]'
                  : 'bg-[#C9281C] text-white hover:bg-[#9B1D15] border-transparent shadow'
              }`}
            >
              {dayMenu?.isPublished ? 'Set to Draft' : 'Publish Menu to Website'}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs transition-colors shadow-xs"
            >
              <Plus size={14} className="text-[#F4B400]" />
              <span>Add Dishes from Catalog</span>
            </button>
          </div>
        </div>

        {/* Scheduled Menu Items List */}
        <div className="space-y-2.5">
          {menuItems.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white border border-[rgba(53,23,15,0.1)] p-6 shadow-xs">
              <Utensils size={32} className="mx-auto text-[#6E5147] mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-[#24100B]">No dishes scheduled for this date</h3>
              <p className="text-xs text-[#6E5147] mt-1 mb-4">
                Add dishes from your master catalog to create tomorrow&apos;s grand feast.
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#24100B] text-[#FFF8EE] font-bold text-xs hover:bg-[#35170F] transition-colors"
              >
                + Add Dishes from Catalog
              </button>
            </div>
          ) : (
            menuItems.map((mItem: any) => {
              const fid = mItem.food_item_id || mItem.foodItemId;
              const food = mItem.food || catalog.find((c) => c.id === fid);
              return (
                <MenuItemRow
                  key={fid}
                  menuItem={mItem}
                  foodItem={food}
                  onStockChange={handleStockChange}
                  onToggleSoldOut={handleToggleSoldOut}
                  onRemove={handleRemove}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Catalog Drawer to Add Dishes */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[#24100B]/60 transition-opacity backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF5ED] border-l border-[rgba(53,23,15,0.15)] flex flex-col shadow-2xl">
              {/* Drawer Header */}
              <div className="p-5 bg-[#24100B] text-[#FFF8EE] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-lg text-[#FFF8EE]">Select from Master Recipe Catalog</h3>
                  <p className="text-xs text-[#F4B400] font-semibold">
                    Scheduling for: {friendlyDate(selectedDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-[#C4AEA5] hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-[rgba(53,23,15,0.1)] bg-white">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E5147]" />
                  <input
                    type="text"
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    placeholder="Search biryanis, pulusu, curries..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF8EE] border border-[rgba(53,23,15,0.15)] text-xs font-semibold text-[#24100B] focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
              </div>

              {/* Catalog Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {catalog
                  .filter((item) =>
                    !drawerSearch.trim() ||
                    item.name.toLowerCase().includes(drawerSearch.toLowerCase()) ||
                    (item.teluguName && item.teluguName.includes(drawerSearch))
                  )
                  .map((item) => {
                    const isAlreadyAdded = currentFids.has(item.id);
                    const isVeg = Boolean(item.isVeg || (item as any).is_veg);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl bg-white border transition-all flex items-center justify-between gap-3 ${
                          isAlreadyAdded
                            ? 'border-[rgba(53,23,15,0.1)] opacity-60'
                            : 'border-[rgba(53,23,15,0.12)] hover:border-[#F57C00] shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isVeg ? <span className="veg-dot" /> : <span className="nonveg-dot" />}
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#24100B] truncate">{item.name}</p>
                            <p className="text-[11px] text-[#6E5147]">
                              ₹{item.price || (item as any).base_price} / {item.unit || (item as any).default_unit}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddItem(item)}
                          disabled={isAlreadyAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isAlreadyAdded
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#C9281C] hover:bg-[#9B1D15] text-white shadow-xs'
                          }`}
                        >
                          {isAlreadyAdded ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
