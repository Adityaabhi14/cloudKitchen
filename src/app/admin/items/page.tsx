'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { FoodItem, ItemStatus, SpiceLevel } from '@/types';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Flame,
  Star,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const UNIT_TYPES = ['g', 'kg', 'ml', 'L', 'pcs', 'plate', 'box', 'jar', 'bowl'];

const CATEGORIES = [
  'Biryani & Pulao',
  'Curries & Pulusu',
  'Full Meals & Combos',
  'Tiffins & Breakfast',
  'Snacks & Starters',
  'Flavoured Rice',
  'Pachadi & Podi',
  'Sweets & Desserts',
  'Beverages',
];

const DEFAULTS = {
  name: '',
  teluguName: '',
  description: '',
  price: 250,
  unitAmount: '500',
  unitType: 'g',
  unit: '500 g',
  category: 'Curries & Pulusu',
  isVeg: false,
  spiceLevel: 3 as SpiceLevel,
  cuisine: 'Andhra',
  imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  availableQuantity: 25,
  maxOrderQty: 4,
  lowStockThreshold: 5,
  status: 'AVAILABLE' as ItemStatus,
  isFeatured: false,
  isActive: true,
  displayOrder: 1,
};

interface ItemModalProps {
  editing: FoodItem | null;
  onSave: (form: typeof DEFAULTS) => Promise<void>;
  onClose: () => void;
}

function ItemModal({ editing, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = useState<typeof DEFAULTS>(() => {
    if (!editing) return { ...DEFAULTS };
    const rawUnit = editing.unit || (editing as any).default_unit || '500 g';
    const parts = rawUnit.split(' ');
    const uAmt = parts[0] || '500';
    const uType = parts[1] || 'g';

    return {
      name:              editing.name,
      teluguName:        editing.teluguName || (editing as any).telugu_name || '',
      description:       editing.description,
      price:             editing.price || (editing as any).base_price || 250,
      unitAmount:        uAmt,
      unitType:          uType,
      unit:              rawUnit,
      category:          editing.category || (editing as any).category_name || 'Curries & Pulusu',
      isVeg:             Boolean(editing.isVeg || (editing as any).is_veg === 1),
      spiceLevel:        (editing.spiceLevel || (editing as any).spice_level || 3) as SpiceLevel,
      cuisine:           (editing as any).cuisine || 'Andhra',
      imageUrl:          editing.imageUrl || (editing as any).image_url || DEFAULTS.imageUrl,
      availableQuantity: editing.availableQuantity || (editing as any).default_stock || 25,
      maxOrderQty:       editing.maxOrderQty || (editing as any).max_order_qty || 4,
      lowStockThreshold: (editing as any).lowStockThreshold || 5,
      status:            (editing.status || 'AVAILABLE') as ItemStatus,
      isFeatured:        Boolean(editing.isFeatured || (editing as any).is_featured === 1),
      isActive:          (editing as any).is_active !== 0,
      displayOrder:      (editing as any).sort_order || 1,
    };
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof DEFAULTS, value: any) =>
    setForm((p) => {
      const next = { ...p, [key]: value };
      if (key === 'unitAmount' || key === 'unitType') {
        next.unit = `${next.unitAmount} ${next.unitType}`;
      }
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white border border-[rgba(53,23,15,0.15)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(53,23,15,0.1)] sticky top-0 bg-[#FFF8EE] z-10">
          <div>
            <h3 className="font-bold text-sm text-[#24100B] uppercase tracking-wider">
              {editing ? 'Edit Food Item Recipe & Pricing' : 'Create New Master Food Item'}
            </h3>
            <p className="text-[11px] text-[#6E5147]">Configure dish details, portions, and media</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#6E5147] hover:text-[#24100B]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs text-[#24100B]">
          
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#C9281C] border-b border-[rgba(53,23,15,0.08)] pb-1.5">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Dish Name (English) *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Gongura Mutton Curry"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Telugu Name</label>
                <input
                  type="text"
                  value={form.teluguName}
                  onChange={(e) => set('teluguName', e.target.value)}
                  placeholder="e.g. గోంగూర మటన్ కూర"
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Description & Culinary Notes *</label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Stone-ground masalas, fresh red-stem gongura leaves, slow-cooked in brass handis..."
                className="admin-input resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Menu Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="admin-input bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Regional Cuisine Style</label>
                <select
                  value={form.cuisine}
                  onChange={(e) => set('cuisine', e.target.value)}
                  className="admin-input bg-white"
                >
                  <option value="Andhra">Andhra Special</option>
                  <option value="Telangana">Telangana Heritage</option>
                  <option value="Hyderabadi">Hyderabadi Nawabi</option>
                  <option value="Rayalaseema">Rayalaseema Spice</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: CLASSIFICATION & SPICE */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#C9281C] border-b border-[rgba(53,23,15,0.08)] pb-1.5">
              2. Classification & Spice Level
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#FFF8EE] border border-[rgba(53,23,15,0.1)]">
                <input
                  type="checkbox"
                  checked={form.isVeg}
                  onChange={(e) => set('isVeg', e.target.checked)}
                  className="accent-[#228B45] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#24100B]">🟢 Pure Vegetarian</span>
              </label>

              <div>
                <label className="admin-label">Spice Flames (1 to 5)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => set('spiceLevel', lvl as SpiceLevel)}
                      className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                        form.spiceLevel >= lvl
                          ? 'bg-[#C9281C]/15 border-[#C9281C] text-[#C9281C]'
                          : 'bg-white border-[rgba(53,23,15,0.1)] text-gray-300'
                      }`}
                    >
                      <Flame size={14} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#FFF8EE] border border-[rgba(53,23,15,0.1)]">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="accent-[#F57C00] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#24100B]">⭐ Featured Dish</span>
              </label>
            </div>
          </div>

          {/* SECTION 3: PRICING & PORTION UNIT */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#C9281C] border-b border-[rgba(53,23,15,0.08)] pb-1.5">
              3. Pricing & Portion Metric
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="admin-label">Base Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Portion Amount *</label>
                <input
                  type="text"
                  required
                  value={form.unitAmount}
                  onChange={(e) => set('unitAmount', e.target.value)}
                  placeholder="e.g. 500 or 1"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Portion Unit Type *</label>
                <select
                  value={form.unitType}
                  onChange={(e) => set('unitType', e.target.value)}
                  className="admin-input bg-white"
                >
                  {UNIT_TYPES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: INVENTORY LIMITS */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#C9281C] border-b border-[rgba(53,23,15,0.08)] pb-1.5">
              4. Inventory & Stock Controls
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="admin-label">Default Available Portions</label>
                <input
                  type="number"
                  value={form.availableQuantity}
                  onChange={(e) => set('availableQuantity', Number(e.target.value))}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Max Qty Per Order</label>
                <input
                  type="number"
                  value={form.maxOrderQty}
                  onChange={(e) => set('maxOrderQty', Number(e.target.value))}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => set('lowStockThreshold', Number(e.target.value))}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: MEDIA */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#C9281C] border-b border-[rgba(53,23,15,0.08)] pb-1.5">
              5. Photography & Media
            </h4>
            <div>
              <label className="admin-label">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                className="admin-input"
              />
            </div>
            {form.imageUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-[rgba(53,23,15,0.1)] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[rgba(53,23,15,0.1)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[rgba(53,23,15,0.2)] text-xs font-bold text-[#6E5147] hover:bg-[#FFF8EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide shadow"
            >
              {saving ? 'Saving...' : editing ? 'Save Dish Changes' : 'Create Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminItemsPage() {
  const [items,      setItems]      = useState<FoodItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('ALL');
  const [vegFilter,  setVegFilter]  = useState('ALL');
  const [editing,    setEditing]    = useState<FoodItem | null>(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [feedback,   setFeedback]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getFoodItems();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (e) {
      console.error('Failed to load items:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSaveItem = async (form: typeof DEFAULTS) => {
    if (editing) {
      await api.updateFoodItem(editing.id, form);
      toast('✅ Item updated in master catalog');
    } else {
      await api.createFoodItem(form);
      toast('✅ New item added to master catalog');
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleDuplicate = async (item: FoodItem) => {
    await api.createFoodItem({
      ...item,
      name: `${item.name} (Copy)`,
      id: undefined,
    });
    toast('✅ Dish duplicated successfully');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this food item?')) return;
    await api.deleteFoodItem(id);
    toast('Item removed from catalog');
    load();
  };

  const filteredItems = items.filter((item: any) => {
    if (catFilter !== 'ALL' && !item.category?.includes(catFilter)) return false;
    const isVeg = Boolean(item.isVeg || item.is_veg === 1);
    if (vegFilter === 'VEG' && !isVeg) return false;
    if (vegFilter === 'NON_VEG' && isVeg) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const n = (item.name || '').toLowerCase();
      const t = (item.teluguName || item.telugu_name || '').toLowerCase();
      if (!n.includes(q) && !t.includes(q)) return false;
    }
    return true;
  });

  return (
    <AdminLayout title="Master Food Items Catalog">
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
              Master Food Items Catalog
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Create and manage all recipes, portion units (g, kg, plate, pcs), spice levels, and prices
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide transition-colors shadow"
          >
            <Plus size={14} className="text-[#F4B400]" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {['ALL', 'VEG', 'NON_VEG'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setVegFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    vegFilter === f
                      ? 'bg-[#24100B] text-[#FFF8EE]'
                      : 'text-[#6E5147] hover:text-[#24100B] bg-[#FFF8EE]'
                  }`}
                >
                  {f === 'ALL' ? 'All Types' : f === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#78716C]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by dish name..."
                className="admin-input !pl-10 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Base Price</th>
                  <th>Portion Unit</th>
                  <th>Spice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-xs text-[#6E5147]">
                      No catalog dishes found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => {
                    const isVeg = Boolean(item.isVeg || item.is_veg === 1);
                    const price = item.price || item.base_price;
                    const unit  = item.unit || item.default_unit;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-[rgba(53,23,15,0.1)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl || item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#24100B]">{item.name}</p>
                              {item.teluguName || item.telugu_name ? (
                                <p className="text-[11px] text-[#6E5147]" style={{ fontFamily: 'var(--font-telugu)' }}>
                                  {item.teluguName || item.telugu_name}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-[#6E5147]">
                          {item.category || item.category_name}
                        </td>
                        <td>
                          <span className={`badge ${isVeg ? 'badge-published' : 'badge-cancelled'}`}>
                            {isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="font-bold text-xs text-[#24100B]">
                          ₹{price}
                        </td>
                        <td className="text-xs text-[#6E5147] font-medium">
                          {unit}
                        </td>
                        <td>
                          <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(item.spiceLevel || item.spice_level || 3, 5) }).map((_, i) => (
                              <Flame key={i} size={11} className="text-[#C9281C]" />
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setEditing(item); setModalOpen(true); }}
                              className="p-1.5 rounded-lg border border-[rgba(53,23,15,0.15)] text-[#6E5147] hover:text-[#24100B] hover:border-[#F57C00] bg-white shadow-sm"
                              title="Edit Dish"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(item)}
                              className="p-1.5 rounded-lg border border-[rgba(53,23,15,0.15)] text-[#6E5147] hover:text-[#24100B] hover:border-[#F57C00] bg-white shadow-sm"
                              title="Duplicate Dish"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg border border-[rgba(53,23,15,0.15)] text-[#6E5147] hover:text-[#C9281C] hover:border-[#C9281C] bg-white shadow-sm"
                              title="Delete Dish"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {modalOpen && (
        <ItemModal
          editing={editing}
          onSave={handleSaveItem}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}
