'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tag, Plus, CheckCircle2, Trash2, X } from 'lucide-react';

const INITIAL_PROMOS = [
  { code: 'VINDUFIRST', discount: '15%', minOrder: 350, uses: 42, status: 'ACTIVE', desc: 'First-time customer welcome feast discount' },
  { code: 'BIRYANI50',  discount: '₹50 OFF', minOrder: 500, uses: 19, status: 'ACTIVE', desc: 'Weekend dum biryani festival coupon' },
  { code: 'SUNDAYFEAST', discount: '20%', minOrder: 800, uses: 8, status: 'EXPIRED', desc: 'Family bulk dining package' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minOrder, setMinOrder] = useState(300);
  const [desc, setDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setPromos([
      ...promos,
      { code: code.toUpperCase(), discount, minOrder, uses: 0, status: 'ACTIVE', desc },
    ]);
    setModalOpen(false);
    setCode('');
    setDiscount('');
    setDesc('');
  };

  return (
    <AdminLayout title="Promotions & Festival Discounts">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
              Promotional Coupons & Fest Offers
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Create and manage promotional discount coupons, minimum cart values, and seasonal deals
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide transition-colors shadow"
          >
            <Plus size={14} className="text-[#F4B400]" />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Redemptions</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.code}>
                    <td className="font-mono font-black text-xs text-[#C9281C]">
                      {p.code}
                    </td>
                    <td className="font-bold text-xs text-[#24100B]">
                      {p.discount}
                    </td>
                    <td className="text-xs text-[#6E5147]">
                      ₹{p.minOrder}
                    </td>
                    <td className="text-xs text-[#6E5147] font-mono">
                      {p.uses} uses
                    </td>
                    <td className="text-xs text-[#6E5147] truncate max-w-[240px]">
                      {p.desc}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-published' : 'badge-draft'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setPromos(promos.filter(x => x.code !== p.code))}
                        className="p-1.5 rounded-lg border border-[rgba(53,23,15,0.15)] text-[#6E5147] hover:text-[#C9281C] hover:border-[#C9281C] bg-white shadow-sm transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white border border-[rgba(53,23,15,0.15)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[rgba(53,23,15,0.1)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#24100B] uppercase tracking-wider">
                  Create Promotional Coupon
                </h3>
                <p className="text-[11px] text-[#6E5147]">Set code and discount parameters</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-[#6E5147] hover:text-[#24100B]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs text-[#24100B]">
              <div>
                <label className="admin-label">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GUNTUR20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="admin-input font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Discount Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="15% or ₹100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Min Order (₹) *</label>
                  <input
                    type="number"
                    required
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Offer Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special festive weekend promotion"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-[rgba(53,23,15,0.1)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(53,23,15,0.2)] text-xs font-bold text-[#6E5147] hover:bg-[#FFF8EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide shadow"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
