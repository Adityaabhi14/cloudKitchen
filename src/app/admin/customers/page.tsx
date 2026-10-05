'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Users,
  Search,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Calendar,
  CheckCircle2,
  X,
  Heart,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Save,
  Mail,
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterType,setFilterType]= useState<'ALL' | 'GOOGLE' | 'ACTIVE' | 'BLOCKED'>('ALL');
  
  // Selected customer for detail drawer
  const [selectedCust, setSelectedCust] = useState<any | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes,    setTempNotes]    = useState('');
  const [actionLoading,setActionLoading]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers').then((r) => r.json());
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (cust: any) => {
    const newStatus = cust.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setActionLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cust.id, status: newStatus }),
      }).then(r => r.json());

      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, status: newStatus } : c));
        if (selectedCust?.id === cust.id) {
          setSelectedCust((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCust) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCust.id, notes: tempNotes }),
      }).then(r => r.json());

      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === selectedCust.id ? { ...c, notes: tempNotes } : c));
        setSelectedCust((prev: any) => ({ ...prev, notes: tempNotes }));
        setEditingNotes(false);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalCustomers = customers.length;
  const googleConnected = customers.filter(c => c.google_id || c.email).length;
  const repeatCustomers = customers.filter(c => (c.ordersCount || 0) > 1).length;
  const totalGMV = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

  const filtered = customers.filter((c) => {
    if (filterType === 'GOOGLE' && !c.google_id && !c.email) return false;
    if (filterType === 'ACTIVE' && c.status === 'BLOCKED') return false;
    if (filterType === 'BLOCKED' && c.status !== 'BLOCKED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const n = (c.name || '').toLowerCase();
      const p = (c.phone || '').toLowerCase();
      const e = (c.email || '').toLowerCase();
      return n.includes(q) || p.includes(q) || e.includes(q);
    }
    return true;
  });

  return (
    <AdminLayout title="Patrons & Customer Profiles">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
              Customer Directory & Profiles
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Verified Google patrons, delivery locations, lifetime spend, and custom kitchen notes
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(53,23,15,0.15)] bg-white text-xs font-semibold text-[#24100B] hover:border-[#C9281C] transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6E5147] uppercase tracking-wider">Total Patrons</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF8EE] flex items-center justify-center text-[#24100B]">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#24100B] mt-2 font-display">{totalCustomers}</p>
            <p className="text-[10px] text-[#6E5147] mt-0.5">Registered accounts</p>
          </div>

          <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#4285F4] uppercase tracking-wider">Google Verified</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#4285F4]">
                <ShieldCheck size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#24100B] mt-2 font-display">{googleConnected}</p>
            <p className="text-[10px] text-[#6E5147] mt-0.5">One-click Google Auth</p>
          </div>

          <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#228B45] uppercase tracking-wider">Repeat Patrons</span>
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-[#228B45]">
                <ShoppingBag size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#24100B] mt-2 font-display">{repeatCustomers}</p>
            <p className="text-[10px] text-[#6E5147] mt-0.5">&gt; 1 Completed order</p>
          </div>

          <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#C9281C] uppercase tracking-wider">Total Customer Spend</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#C9281C]">
                <IndianRupee size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#C9281C] mt-2 font-display">₹{totalGMV.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#6E5147] mt-0.5">Lifetime platform GMV</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#78716C]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patron name, phone number, or Google email..."
              className="admin-input !pl-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'GOOGLE', 'ACTIVE', 'BLOCKED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  filterType === tab
                    ? 'bg-[#24100B] text-[#FFF8EE]'
                    : 'bg-[#FFF8EE] text-[#6E5147] hover:bg-[#FAF1E2]'
                }`}
              >
                {tab === 'ALL' && 'All Patrons'}
                {tab === 'GOOGLE' && 'Google Connected'}
                {tab === 'ACTIVE' && 'Active Only'}
                {tab === 'BLOCKED' && 'Suspended'}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Contact Info</th>
                  <th>Authentication</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spend</th>
                  <th>Delivery Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-xs text-[#6E5147]">
                      No patron profiles found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cust) => {
                    const isGoogle = Boolean(cust.google_id || (cust.email && cust.email.includes('@')));
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => {
                          setSelectedCust(cust);
                          setTempNotes(cust.notes || '');
                          setEditingNotes(false);
                        }}
                        className="cursor-pointer hover:bg-[#FFF8EE]/60 transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-2.5">
                            {cust.profile_image ? (
                              <img
                                src={cust.profile_image}
                                alt={cust.name}
                                className="w-8 h-8 rounded-full object-cover border border-[rgba(53,23,15,0.15)] shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#FAF1E2] border border-[rgba(53,23,15,0.15)] flex items-center justify-center text-[#24100B] text-xs font-black shadow-sm">
                                {(cust.name || 'C').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-xs text-[#24100B]">{cust.name}</p>
                              <p className="text-[10px] text-[#6E5147] font-mono">ID: {cust.id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="space-y-0.5">
                            {cust.phone && (
                              <p className="text-xs font-mono text-[#24100B] flex items-center gap-1">
                                <Phone size={11} className="text-[#6E5147]" /> {cust.phone}
                              </p>
                            )}
                            {cust.email && (
                              <p className="text-[11px] text-[#6E5147] flex items-center gap-1 truncate max-w-[160px]">
                                <Mail size={11} className="text-[#6E5147]" /> {cust.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td>
                          {isGoogle ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1A73E8] text-[10px] font-bold">
                              <svg className="w-3 h-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                              </svg>
                              Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-[#6E5147] text-[10px] font-bold">
                              Phone Only
                            </span>
                          )}
                        </td>

                        <td className="text-xs font-bold text-[#24100B]">
                          {cust.ordersCount || 0} orders
                        </td>

                        <td className="text-xs font-black text-[#C9281C]">
                          ₹{(cust.totalSpend || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="text-xs text-[#6E5147] truncate max-w-[180px]">
                          {cust.address || (cust.addresses?.length ? `${cust.addresses[0].area}, ${cust.addresses[0].city}` : '—')}
                        </td>

                        <td>
                          <span className={`badge ${cust.status === 'BLOCKED' ? 'badge-draft' : 'badge-published'}`}>
                            {cust.status === 'BLOCKED' ? 'Suspended' : 'Active'}
                          </span>
                        </td>

                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCust(cust);
                              setTempNotes(cust.notes || '');
                              setEditingNotes(false);
                            }}
                            className="px-3 py-1 rounded-lg border border-[rgba(53,23,15,0.15)] bg-white text-[11px] font-bold text-[#24100B] hover:border-[#C9281C] hover:text-[#C9281C] transition-colors"
                          >
                            View Profile
                          </button>
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

      {/* Customer Detail Drawer Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF1E2] h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right border-l border-[rgba(53,23,15,0.2)]">
            
            {/* Drawer Header */}
            <div className="p-5 bg-[#24100B] text-[#FFF8EE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCust.profile_image ? (
                  <img
                    src={selectedCust.profile_image}
                    alt={selectedCust.name}
                    className="w-12 h-12 rounded-full border-2 border-[#F4B400] object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F57C00] to-[#C9281C] flex items-center justify-center text-white font-black text-lg">
                    {(selectedCust.name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base font-display">{selectedCust.name}</h3>
                  <p className="text-xs text-[#F4B400] font-mono">{selectedCust.phone || 'No phone registered'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCust(null)}
                className="p-1.5 rounded-lg text-[#C4AEA5] hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Account Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[rgba(53,23,15,0.12)]">
                  <span className="text-[10px] font-bold text-[#6E5147] uppercase">Total Orders</span>
                  <p className="text-lg font-black text-[#24100B] mt-0.5">{selectedCust.ordersCount || 0}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[rgba(53,23,15,0.12)]">
                  <span className="text-[10px] font-bold text-[#6E5147] uppercase">Lifetime GMV</span>
                  <p className="text-lg font-black text-[#C9281C] mt-0.5">₹{(selectedCust.totalSpend || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Authentication Credentials */}
              <div className="bg-white p-4 rounded-xl border border-[rgba(53,23,15,0.12)] space-y-2.5">
                <h4 className="text-xs font-bold text-[#24100B] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#228B45]" /> Authentication & Contact
                </h4>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-[rgba(53,23,15,0.06)]">
                    <span className="text-[#6E5147]">Customer ID:</span>
                    <span className="font-mono font-bold text-[#24100B]">{selectedCust.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[rgba(53,23,15,0.06)]">
                    <span className="text-[#6E5147]">Google Account:</span>
                    <span className="font-semibold text-[#1A73E8]">{selectedCust.email || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[rgba(53,23,15,0.06)]">
                    <span className="text-[#6E5147]">Mobile Phone:</span>
                    <span className="font-mono font-bold text-[#24100B]">{selectedCust.phone || 'Not added'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6E5147]">Account Status:</span>
                    <span className={`font-bold ${selectedCust.status === 'BLOCKED' ? 'text-red-600' : 'text-green-700'}`}>
                      {selectedCust.status === 'BLOCKED' ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Delivery Addresses */}
              <div className="bg-white p-4 rounded-xl border border-[rgba(53,23,15,0.12)] space-y-3">
                <h4 className="text-xs font-bold text-[#24100B] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#F57C00]" /> Saved Delivery Addresses ({selectedCust.addresses?.length || 0})
                </h4>
                {(!selectedCust.addresses || selectedCust.addresses.length === 0) ? (
                  <p className="text-xs text-[#6E5147] italic">No saved delivery addresses yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCust.addresses.map((addr: any) => (
                      <div key={addr.id} className="p-3 bg-[#FFF8EE] rounded-lg border border-[rgba(53,23,15,0.08)] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#24100B] flex items-center gap-1">
                            {addr.label}
                            {addr.is_default && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#228B45] text-white font-black">
                                DEFAULT
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[#6E5147]">{addr.phone}</span>
                        </div>
                        <p className="text-[#6E5147]">{addr.house_flat}, {addr.street}, {addr.area}</p>
                        <p className="text-[#6E5147] font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.instructions && (
                          <p className="text-[11px] text-[#C9281C] italic">Note: {addr.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kitchen Admin Notes */}
              <div className="bg-white p-4 rounded-xl border border-[rgba(53,23,15,0.12)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#24100B] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-[#6E5147]" /> Kitchen Notes & Special Preferences
                  </h4>
                  {!editingNotes && (
                    <button
                      onClick={() => {
                        setTempNotes(selectedCust.notes || '');
                        setEditingNotes(true);
                      }}
                      className="text-[11px] font-bold text-[#C9281C] hover:underline flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>

                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add customer preferences, spice tolerances, or special delivery notes..."
                      className="admin-input text-xs min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="px-3 py-1 rounded-lg border border-[rgba(53,23,15,0.15)] text-xs font-bold text-[#6E5147]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-[#24100B] text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Save size={12} /> Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#6E5147] bg-[#FFF8EE] p-3 rounded-lg border border-[rgba(53,23,15,0.06)]">
                    {selectedCust.notes || 'No custom notes recorded for this customer.'}
                  </p>
                )}
              </div>

              {/* Status Action */}
              <div className="pt-2">
                <button
                  onClick={() => handleToggleStatus(selectedCust)}
                  disabled={actionLoading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    selectedCust.status === 'BLOCKED'
                      ? 'bg-[#228B45] hover:bg-green-800 text-white'
                      : 'bg-[#C9281C] hover:bg-red-800 text-white'
                  }`}
                >
                  {selectedCust.status === 'BLOCKED' ? (
                    <>
                      <ShieldCheck size={15} /> Activate Patron Account
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={15} /> Suspend / Block Patron
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
