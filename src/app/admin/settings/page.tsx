'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { KitchenSettings, DeliveryZone } from '@/types';
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Globe,
  IndianRupee,
  Bell,
  Truck,
  Store,
  ShieldCheck,
  Layers,
  Edit2,
} from 'lucide-react';

const TABS = [
  { id: 'kitchen',       label: 'Kitchen Status',     icon: Globe },
  { id: 'info',          label: 'General Information', icon: Store },
  { id: 'ordering',      label: 'Order Rules & Time', icon: Clock },
  { id: 'delivery',      label: 'Delivery & Pricing', icon: Truck },
  { id: 'zones',         label: 'Delivery Zones & Pincodes', icon: Layers },
  { id: 'slots',         label: 'Delivery Slots',     icon: MapPin },
  { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
];

export default function AdminSettingsPage() {
  const [settings,    setSettings]    = useState<KitchenSettings | null>(null);
  const [zones,       setZones]       = useState<DeliveryZone[]>([]);
  const [activeTab,   setActiveTab]   = useState<string>('kitchen');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [feedback,    setFeedback]    = useState('');

  // Zone creation form
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee,  setNewZoneFee]  = useState(35);
  const [newZonePins, setNewZonePins] = useState('');
  const [newZoneMin,  setNewZoneMin]  = useState(299);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, zonesRes] = await Promise.all([
        api.getSettings(),
        fetch('/api/delivery-zones').then(r => r.json()).catch(() => ({ success: false })),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data.settings);
      }
      if (zonesRes.success && Array.isArray(zonesRes.data)) {
        setZones(zonesRes.data);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        toast('✅ Settings updated successfully!');
      } else {
        toast('❌ Failed to save settings.');
      }
    } catch (e) {
      toast('❌ Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZonePins) return;
    const pinArray = newZonePins.split(',').map(p => p.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newZoneName,
          pincodes: pinArray,
          deliveryFee: Number(newZoneFee),
          minOrder: Number(newZoneMin),
          maxDistanceKm: 15,
        }),
      }).then(r => r.json());

      if (res.success) {
        toast('✅ Delivery zone added!');
        setShowAddZone(false);
        setNewZoneName('');
        setNewZonePins('');
        load();
      }
    } catch {
      toast('❌ Failed to create zone');
    }
  };

  // Slots management
  const slots: string[] = Array.isArray((settings as any)?.deliverySlots)
    ? (settings as any).deliverySlots
    : Array.isArray((settings as any)?.delivery_slots)
    ? (settings as any).delivery_slots
    : [];

  const setSlots = (newSlots: string[]) => {
    if (!settings) return;
    const key = 'deliverySlots' in settings ? 'deliverySlots' : 'delivery_slots';
    setSettings((p) => p ? { ...p, [key]: newSlots } as any : p);
  };

  const addSlot = () => setSlots([...slots, 'Evening Tiffins (05:00 PM - 06:30 PM)']);
  const removeSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, val: string) => {
    const s = [...slots]; s[i] = val; setSlots(s);
  };

  if (loading) {
    return (
      <AdminLayout title="Kitchen Settings">
        <div className="flex items-center justify-center h-64 text-[#6E5147]">
          <RefreshCw size={22} className="animate-spin mr-2" /> Loading kitchen settings…
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout title="Kitchen Settings">
        <div className="text-center py-12 text-[#6E5147]">Could not load kitchen settings.</div>
      </AdminLayout>
    );
  }

  const cutoff = (settings as any).orderCutoffTime || (settings as any).order_cutoff_time || '22:00';
  const minOrder = (settings as any).minimumOrderAmount || (settings as any).minimum_order_amount || 200;
  const deliveryFee = (settings as any).deliveryFee || (settings as any).delivery_fee || 40;
  const freeDelivery = (settings as any).freeDeliveryAbove || (settings as any).free_delivery_above || 500;
  const kitchenName = (settings as any).kitchenName || (settings as any).kitchen_name || 'Vindu Ruchulu';
  const phone = (settings as any).contactPhone || (settings as any).contact_phone || '+91 98765 43210';
  const email = (settings as any).contactEmail || (settings as any).contact_email || 'orders@vinduruchulu.com';
  const address = (settings as any).kitchenAddress || (settings as any).kitchen_address || 'Plot 42, Road No. 36, Jubilee Hills, Hyderabad';
  const isOpen = (settings as any).isAcceptingOrders ?? (settings as any).is_accepting_orders ?? true;

  return (
    <AdminLayout title="Kitchen Control Center Settings">
      {feedback && (
        <div className="toast">
          <CheckCircle2 size={16} className="text-[#228B45]" />
          <span className="text-[#24100B] text-xs font-bold">{feedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-[rgba(53,23,15,0.1)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
            Kitchen Operations & Website Configuration
          </h2>
          <p className="text-xs text-[#6E5147] mt-0.5">
            Control order acceptance, daily cutoff schedules, delivery fees, and contact details
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs tracking-wide uppercase transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save size={15} className="text-[#F4B400]" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
        
        {/* Left Column: Vertical Tab Navigation */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-2.5 space-y-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#24100B] text-[#FFF8EE] shadow-sm'
                    : 'text-[#6E5147] hover:text-[#24100B] hover:bg-[#FFF8EE]'
                }`}
              >
                <Icon size={15} className={active ? 'text-[#F4B400]' : 'text-[#6E5147]'} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Tab Content */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* TAB 1: Kitchen Status */}
          {activeTab === 'kitchen' && (
            <div className="space-y-4">
              <div className="border-b border-[rgba(53,23,15,0.08)] pb-3">
                <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                  Live Kitchen Order Acceptance
                </h3>
                <p className="text-xs text-[#6E5147] mt-0.5">
                  Control whether customers can place next-day pre-orders on the storefront website.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FFF8EE] rounded-xl border border-[rgba(53,23,15,0.1)]">
                <div>
                  <p className="text-sm font-bold text-[#24100B]">
                    Kitchen Status: {isOpen ? 'OPEN' : 'CLOSED'}
                  </p>
                  <p className="text-xs text-[#6E5147] mt-0.5">
                    {isOpen ? '🟢 Kitchen is actively accepting next-day pre-orders' : '🔴 Kitchen is closed to new customer pre-orders'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const key = 'isAcceptingOrders' in settings ? 'isAcceptingOrders' : 'is_accepting_orders';
                    setSettings((p) => p ? { ...p, [key]: !isOpen } as any : p);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isOpen ? 'bg-[#228B45]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOpen ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: General Information */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="border-b border-[rgba(53,23,15,0.08)] pb-3">
                <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                  Kitchen Information & Contact
                </h3>
                <p className="text-xs text-[#6E5147] mt-0.5">
                  Brand name, kitchen facility address, and support numbers displayed to customers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Kitchen Brand Name *</label>
                  <input
                    type="text"
                    value={kitchenName}
                    onChange={(e) => {
                      const key = 'kitchenName' in settings ? 'kitchenName' : 'kitchen_name';
                      setSettings((p) => p ? { ...p, [key]: e.target.value } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Customer Support Phone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      const key = 'contactPhone' in settings ? 'contactPhone' : 'contact_phone';
                      setSettings((p) => p ? { ...p, [key]: e.target.value } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Support Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const key = 'contactEmail' in settings ? 'contactEmail' : 'contact_email';
                      setSettings((p) => p ? { ...p, [key]: e.target.value } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="admin-label">Kitchen Facility Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      const key = 'kitchenAddress' in settings ? 'kitchenAddress' : 'kitchen_address';
                      setSettings((p) => p ? { ...p, [key]: e.target.value } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Order Rules & Time */}
          {activeTab === 'ordering' && (
            <div className="space-y-4">
              <div className="border-b border-[rgba(53,23,15,0.08)] pb-3">
                <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                  Order Cutoff & Basket Rules
                </h3>
                <p className="text-xs text-[#6E5147] mt-0.5">
                  Daily pre-order cutoff times and minimum basket amounts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Daily Order Cutoff Time *</label>
                  <input
                    type="text"
                    value={cutoff}
                    onChange={(e) => {
                      const key = 'orderCutoffTime' in settings ? 'orderCutoffTime' : 'order_cutoff_time';
                      setSettings((p) => p ? { ...p, [key]: e.target.value } as any : p);
                    }}
                    placeholder="22:00 or 10:00 PM"
                    className="admin-input font-mono"
                  />
                  <p className="text-[11px] text-[#6E5147] mt-1">
                    Customers cannot order after this time for next-day fulfillment.
                  </p>
                </div>
                <div>
                  <label className="admin-label">Minimum Order Amount (₹) *</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => {
                      const key = 'minimumOrderAmount' in settings ? 'minimumOrderAmount' : 'minimum_order_amount';
                      setSettings((p) => p ? { ...p, [key]: Number(e.target.value) } as any : p);
                    }}
                    className="admin-input"
                  />
                  <p className="text-[11px] text-[#6E5147] mt-1">
                    Cart total must equal or exceed this threshold.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Delivery & Pricing */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="border-b border-[rgba(53,23,15,0.08)] pb-3">
                <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                  Delivery Logistics & Thresholds
                </h3>
                <p className="text-xs text-[#6E5147] mt-0.5">
                  Configure delivery logistics charges and free delivery perks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Standard Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => {
                      const key = 'deliveryFee' in settings ? 'deliveryFee' : 'delivery_fee';
                      setSettings((p) => p ? { ...p, [key]: Number(e.target.value) } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Free Delivery For Orders Above (₹) *</label>
                  <input
                    type="number"
                    value={freeDelivery}
                    onChange={(e) => {
                      const key = 'freeDeliveryAbove' in settings ? 'freeDeliveryAbove' : 'free_delivery_above';
                      setSettings((p) => p ? { ...p, [key]: Number(e.target.value) } as any : p);
                    }}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Delivery Zones & Pincodes */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(53,23,15,0.08)] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                    Hyderabad Delivery Zones & Pincode Routing
                  </h3>
                  <p className="text-xs text-[#6E5147] mt-0.5">
                    Configure localized delivery zones and dynamic fees based on customer pincode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddZone(!showAddZone)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-xs font-bold text-[#FFF8EE] transition-colors shadow-sm"
                >
                  <Plus size={13} className="text-[#F4B400]" />
                  <span>{showAddZone ? 'Cancel' : 'Add New Zone'}</span>
                </button>
              </div>

              {/* Add Zone Form */}
              {showAddZone && (
                <form onSubmit={handleCreateZone} className="p-4 bg-[#FFF8EE] rounded-xl border border-[rgba(53,23,15,0.12)] space-y-3">
                  <h4 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">Add New Delivery Zone</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="admin-label">Zone Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Gachibowli & Financial District"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="admin-input text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="admin-label">Delivery Fee (₹) *</label>
                      <input
                        type="number"
                        value={newZoneFee}
                        onChange={(e) => setNewZoneFee(Number(e.target.value))}
                        className="admin-input text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="admin-label">Min Order (₹)</label>
                      <input
                        type="number"
                        value={newZoneMin}
                        onChange={(e) => setNewZoneMin(Number(e.target.value))}
                        className="admin-input text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="admin-label">Covered Pincodes (Comma separated) *</label>
                      <input
                        type="text"
                        placeholder="500032, 500081, 500084, 500075"
                        value={newZonePins}
                        onChange={(e) => setNewZonePins(e.target.value)}
                        className="admin-input text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#228B45] text-white text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      Save Zone
                    </button>
                  </div>
                </form>
              )}

              {/* Zones List */}
              <div className="space-y-3">
                {zones.map((z: any) => (
                  <div key={z.id} className="p-4 bg-[#FAF1E2] rounded-xl border border-[rgba(53,23,15,0.1)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-[#24100B]">{z.name}</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-800 font-bold">
                          ₹{z.delivery_fee ?? z.deliveryFee} Fee
                        </span>
                      </div>
                      <span className="text-xs text-[#6E5147] font-semibold">
                        Min Order: ₹{z.min_order ?? z.minOrder ?? 299}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {z.pincodes.map((pin: string) => (
                        <span key={pin} className="px-2 py-0.5 bg-white rounded-md text-[11px] font-mono font-bold text-[#24100B] border border-[rgba(53,23,15,0.1)]">
                          {pin}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Delivery Slots */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(53,23,15,0.08)] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                    Fulfillment Delivery Windows
                  </h3>
                  <p className="text-xs text-[#6E5147] mt-0.5">
                    Time slots available for customer selection during checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSlot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-xs font-bold text-[#FFF8EE] transition-colors shadow-sm"
                >
                  <Plus size={13} className="text-[#F4B400]" />
                  <span>Add Window</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slot}
                      onChange={(e) => updateSlot(i, e.target.value)}
                      className="admin-input flex-1 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      disabled={slots.length <= 1}
                      className="p-2 rounded-xl text-[#6E5147] hover:text-[#C9281C] hover:bg-[#C9281C]/10 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Remove Window"
                      aria-label="Remove slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Notifications & Alerts */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="border-b border-[rgba(53,23,15,0.08)] pb-3">
                <h3 className="text-xs font-bold text-[#24100B] uppercase tracking-wider">
                  Automated Customer Notifications
                </h3>
                <p className="text-xs text-[#6E5147] mt-0.5">
                  Real-time SMS and WhatsApp booking confirmations.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-[#FFF8EE] rounded-xl border border-[rgba(53,23,15,0.1)]">
                  <div>
                    <p className="text-xs font-bold text-[#24100B]">WhatsApp Booking Confirmation</p>
                    <p className="text-[11px] text-[#6E5147]">Send instant meal pre-order ticket to customer mobile</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#228B45] w-4 h-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FFF8EE] rounded-xl border border-[rgba(53,23,15,0.1)]">
                  <div>
                    <p className="text-xs font-bold text-[#24100B]">Dawn Handi Cooking Alert</p>
                    <p className="text-[11px] text-[#6E5147]">Notify customer when slow-cooking starts at dawn</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#228B45] w-4 h-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#FFF8EE] rounded-xl border border-[rgba(53,23,15,0.1)]">
                  <div>
                    <p className="text-xs font-bold text-[#24100B]">Out for Delivery Dispatch Link</p>
                    <p className="text-[11px] text-[#6E5147]">Send live tracking link when rider departs kitchen</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#228B45] w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div className="pt-4 border-t border-[rgba(53,23,15,0.08)] flex justify-end">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save size={15} className="text-[#F4B400]" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
