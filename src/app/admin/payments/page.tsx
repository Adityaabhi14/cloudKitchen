'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { Order, PaymentMethod, PaymentStatus } from '@/types';
import {
  IndianRupee,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownLeft,
  ShieldCheck,
} from 'lucide-react';

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  REFUNDED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  PARTIALLY_REFUNDED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Failed to load payment transactions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredOrders = orders.filter((ord) => {
    const payStatus = ord.paymentStatus || (ord as any).payment_status || 'PENDING';
    if (statusFilter !== 'ALL' && payStatus !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const orderNum = (ord.orderNumber || (ord as any).order_number || '').toLowerCase();
      const custName = (ord.customer?.name || (ord as any).customer_name || '').toLowerCase();
      const custPhone = (ord.customer?.phone || (ord as any).customer_phone || '');
      const payId = (ord.razorpayPaymentId || (ord as any).razorpay_payment_id || '').toLowerCase();
      return orderNum.includes(q) || custName.includes(q) || custPhone.includes(q) || payId.includes(q);
    }

    return true;
  });

  const totalCollected = orders
    .filter((o) => (o.paymentStatus || (o as any).payment_status) === 'PAID')
    .reduce((sum, o) => sum + (o.total || (o as any).total_amount || 0), 0);

  const pendingAmount = orders
    .filter((o) => (o.paymentStatus || (o as any).payment_status) === 'PENDING')
    .reduce((sum, o) => sum + (o.total || (o as any).total_amount || 0), 0);

  return (
    <AdminLayout title="Payment Management">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Total Collected</span>
            <div className="text-2xl font-black text-[#2E7D32]">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#78716C]">Settled via Razorpay / UPI</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Pending Payments</span>
            <div className="text-2xl font-black text-amber-600">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#78716C]">Awaiting checkout completion</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#78716C] uppercase">Payment Gateway</span>
            <div className="text-2xl font-black text-[#35170F] flex items-center gap-2">
              <ShieldCheck size={22} className="text-[#2E7D32]" /> Live Active
            </div>
            <div className="text-[10px] text-[#78716C]">UPI, Cards & NetBanking</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#FAF5ED] border border-[#2E1A11]/10 text-xs font-semibold focus:outline-none focus:border-[#C9281C]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#C9281C] text-white'
                    : 'bg-[#FAF5ED] text-[#35170F] hover:bg-[#F0E6D6]'
                }`}
              >
                {st}
              </button>
            ))}
            <button
              onClick={load}
              className="p-2 rounded-xl bg-[#FAF5ED] hover:bg-[#F0E6D6] text-[#2E1A11]"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-[#2E1A11]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF5ED] border-b border-[#2E1A11]/10 text-[11px] font-black text-[#78716C] uppercase">
                  <th className="p-4">Transaction / Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Dining Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E1A11]/5 font-medium text-[#2E1A11]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#78716C] font-semibold italic">
                      No payment transactions match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const payStatus = ord.paymentStatus || (ord as any).payment_status || 'PENDING';
                    const badge = STATUS_BADGE[payStatus] || STATUS_BADGE.PENDING;
                    const orderNum = ord.orderNumber || (ord as any).order_number;
                    const payId = ord.razorpayPaymentId || (ord as any).razorpay_payment_id || `txn_${ord.id.replace('ord-', '')}`;
                    const timeStr = new Date(ord.createdAt || (ord as any).created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={ord.id} className="hover:bg-[#FFF8EE]/50 transition-colors">
                        <td className="p-4 font-bold">
                          <div className="text-[#C9281C]">#{orderNum}</div>
                          <div className="text-[10px] text-[#78716C] font-mono">{payId}</div>
                        </td>
                        <td className="p-4 font-bold">
                          <div>{ord.customer?.name || (ord as any).customer_name}</div>
                          <div className="text-[11px] text-[#78716C] font-normal">
                            {ord.customer?.phone || (ord as any).customer_phone}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[#78716C]">
                          {ord.menuDate || (ord as any).menu_date}
                        </td>
                        <td className="p-4 font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#2E1A11]/10 text-[10px]">
                            {ord.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td className="p-4 font-black text-sm text-[#2E1A11]">
                          ₹{ord.total || (ord as any).total_amount || 0}
                        </td>
                        <td className="p-4 font-bold">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {payStatus}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] text-[#78716C]">{timeStr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
