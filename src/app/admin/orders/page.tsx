'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  RefreshCw,
  Printer,
  Phone,
  MapPin,
  Clock,
  X,
  CheckCircle2,
  Package,
  Calendar,
  Utensils,
  ArrowRight,
} from 'lucide-react';

const STATUS_FLOW: Record<string, { next: OrderStatus | null; label: string; cls: string }> = {
  PENDING:   { next: 'CONFIRMED',        label: 'Confirm Order',  cls: 'bg-[#F4B400]/15 text-[#B45309] border-[#F4B400]/30 hover:bg-[#F4B400]/25' },
  CONFIRMED: { next: 'PREPARING',        label: 'Start Cooking',  cls: 'bg-[#F57C00]/15 text-[#C2410C] border-[#F57C00]/30 hover:bg-[#F57C00]/25' },
  PREPARING: { next: 'READY',            label: 'Mark Ready',     cls: 'bg-[#C9281C]/15 text-[#C9281C] border-[#C9281C]/30 hover:bg-[#C9281C]/25' },
  READY:     { next: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25' },
  OUT_FOR_DELIVERY: { next: 'DELIVERED', label: 'Mark Delivered', cls: 'bg-[#228B45]/15 text-[#228B45] border-[#228B45]/30 hover:bg-[#228B45]/25' },
  DELIVERED: { next: null,               label: 'Delivered ✓',    cls: 'bg-[#228B45]/10 text-[#166534] border-[#228B45]/20 cursor-default' },
  CANCELLED: { next: null,               label: 'Cancelled',      cls: 'bg-gray-100 text-gray-500 border-gray-200 cursor-default' },
};

const BADGE_CLS: Record<string, string> = {
  PENDING:          'badge badge-pending',
  CONFIRMED:        'badge badge-confirmed',
  PREPARING:        'badge badge-preparing',
  READY:            'badge badge-ready',
  OUT_FOR_DELIVERY: 'badge badge-ready text-blue-600 border-blue-200 bg-blue-50',
  DELIVERED:        'badge badge-delivered',
  CANCELLED:        'badge badge-cancelled',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={BADGE_CLS[status] || 'badge badge-draft'}>{status.replace(/_/g, ' ')}</span>;
}

function KOTPrint({ order, onClose }: { order: Order; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const status   = order.orderStatus || (order as any).order_status;
  const name     = order.customer?.name || (order as any).customer_name || 'Customer';
  const phone    = order.customer?.phone || (order as any).customer_phone || '—';
  const address  = order.deliveryAddress?.addressLine1 || (order as any).delivery_address || '—';
  const slot     = order.deliveryAddress?.deliverySlot || (order as any).delivery_slot || 'Standard';
  const items    = order.items || [];

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank', 'width=440,height=640');
    if (!win || !content) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT #${order.orderNumber} - Vindu Ruchulu</title>
          <style>
            body { font-family: monospace; font-size: 13px; padding: 18px; color: #24100B; }
            h2 { text-align: center; margin: 0 0 4px; font-size: 17px; font-weight: bold; }
            .divider { border: none; border-top: 1px dashed #35170F; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .label { color: #6E5147; font-size: 11px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white border border-[rgba(53,23,15,0.15)] rounded-2xl w-full max-w-md shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(53,23,15,0.1)] bg-[#FFF8EE]">
          <div>
            <h3 className="font-bold text-sm text-[#24100B] uppercase tracking-wider">
              Kitchen Order Ticket (KOT)
            </h3>
            <p className="text-[11px] text-[#6E5147]">Printable cook & packaging sheet</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#6E5147] hover:text-[#24100B]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 font-mono text-xs text-[#24100B]" ref={printRef}>
          <h2 className="text-center font-bold text-base text-[#24100B] mb-0.5">VINDU RUCHULU</h2>
          <p className="text-center text-[11px] text-[#6E5147] mb-3">Dawn Batch Handi Kitchen Ticket</p>
          <hr className="border-dashed border-[rgba(53,23,15,0.2)] mb-3" />
          
          <div className="flex justify-between mb-1">
            <span className="text-[#6E5147]">Order Ref:</span>
            <span className="font-bold text-[#C9281C]">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-[#6E5147]">Dining Date:</span>
            <span className="font-bold">{(order as any).menu_date || order.menuDate}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-[#6E5147]">Delivery Slot:</span>
            <span className="font-bold text-[#24100B]">{slot}</span>
          </div>

          <hr className="border-dashed border-[rgba(53,23,15,0.2)] my-3" />
          <p className="text-[#6E5147] text-[10px] uppercase font-bold mb-1">CUSTOMER & ADDRESS</p>
          <p className="font-bold text-sm text-[#24100B]">{name}</p>
          <p className="text-[#6E5147]">{phone}</p>
          <p className="text-[#6E5147] mt-1">{address}</p>

          <hr className="border-dashed border-[rgba(53,23,15,0.2)] my-3" />
          <p className="text-[#6E5147] text-[10px] uppercase font-bold mb-2">ORDERED DISHES</p>
          <div className="space-y-1.5">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <span>
                  <strong className="text-[#24100B]">{it.quantity}x</strong> {it.name || it.foodItemId}
                </span>
                <span className="font-bold">₹{((it.price || it.unitPrice || 0) * it.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <hr className="border-dashed border-[rgba(53,23,15,0.2)] my-3" />
          <div className="flex justify-between font-bold text-sm text-[#24100B]">
            <span>TOTAL AMOUNT</span>
            <span className="text-[#C9281C]">₹{(order.total || (order as any).total_amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <p className="text-center text-[10px] text-[#6E5147] mt-3">
            Payment: {order.paymentMethod || (order as any).payment_method || 'Online'} ({order.paymentStatus || (order as any).payment_status || 'PAID'})
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-2 border-t border-[rgba(53,23,15,0.08)] bg-[#FFF8EE]/40">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[rgba(53,23,15,0.18)] text-xs font-bold text-[#6E5147] hover:bg-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-xs uppercase tracking-wide transition-colors shadow-sm"
          >
            <Printer size={14} className="text-[#F4B400]" />
            <span>Print KOT</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [kotOrder,     setKotOrder]     = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await api.updateOrderStatus(orderId, nextStatus);
    load();
  };

  const filteredOrders = orders.filter((ord: any) => {
    const status = ord.order_status || ord.orderStatus || 'PENDING';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const num = (ord.order_number || ord.orderNumber || '').toLowerCase();
      const cust = (ord.customer_name || ord.customer?.name || '').toLowerCase();
      const phone = (ord.customer_phone || ord.customer?.phone || '').toLowerCase();
      if (!num.includes(q) && !cust.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <AdminLayout title="Kitchen Orders Management">
      <div className="space-y-5">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
              Incoming & Scheduled Orders
            </h2>
            <p className="text-xs text-[#6E5147] mt-0.5">
              Live fulfillment status, handi cooking advancement, and printed kitchen order tickets
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(53,23,15,0.15)] bg-white text-xs font-semibold text-[#24100B] hover:border-[#C9281C] transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-4 space-y-3 shadow-sm">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {statuses.map((st) => {
              const count = st === 'ALL'
                ? orders.length
                : orders.filter((o: any) => (o.order_status || o.orderStatus) === st).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 btn-tactile ${
                    statusFilter === st
                      ? 'bg-[#24100B] text-[#FFF8EE] shadow-sm'
                      : 'text-[#6E5147] hover:text-[#24100B] bg-[#FFF8EE] border border-[rgba(53,23,15,0.08)]'
                  }`}
                >
                  <span>{st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === st ? 'bg-white/20 text-white' : 'bg-white text-[#6E5147] border border-[rgba(53,23,15,0.1)]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#78716C]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID (#TEL-10482), customer name, or phone number..."
              className="admin-input !pl-10 text-xs"
            />
          </div>
        </div>

        {/* Orders Data Table */}
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date & Slot</th>
                  <th>Items Ordered</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-xs text-[#6E5147]">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord: any) => {
                    const orderId  = ord.id;
                    const orderNum = ord.order_number || ord.orderNumber || orderId;
                    const custName = ord.customer_name || ord.customer?.name || 'Customer';
                    const phone    = ord.customer_phone || ord.customer?.phone || '—';
                    const date     = ord.menu_date || ord.menuDate;
                    const slot     = ord.delivery_slot || ord.deliveryAddress?.deliverySlot || 'Standard';
                    const status   = ord.order_status || ord.orderStatus || 'PENDING';
                    const total    = ord.total_amount || ord.total || 0;
                    const payStatus= ord.payment_status || ord.paymentStatus || 'PAID';
                    const items    = ord.items || [];
                    const flow     = STATUS_FLOW[status];

                    return (
                      <tr key={orderId}>
                        <td className="font-mono font-bold text-xs text-[#C9281C] whitespace-nowrap">
                          #{orderNum}
                        </td>
                        <td>
                          <p className="font-bold text-xs text-[#24100B]">{custName}</p>
                          <p className="text-[11px] text-[#6E5147]">{phone}</p>
                        </td>
                        <td className="text-xs">
                          <p className="font-bold text-[#24100B]">{date}</p>
                          <p className="text-[11px] text-[#6E5147]">{slot}</p>
                        </td>
                        <td className="text-xs text-[#6E5147]">
                          {items.length > 0 ? (
                            <span title={items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                              <strong className="text-[#24100B]">{items[0].quantity}x</strong> {items[0].name}
                              {items.length > 1 && ` +${items.length - 1} more`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="font-bold text-xs text-[#24100B]">
                          ₹{total}
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            payStatus === 'PAID' ? 'bg-[#228B45]/15 text-[#166534]' : 'bg-[#F4B400]/20 text-[#B45309]'
                          }`}>
                            {payStatus}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={status} />
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {flow && flow.next && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(orderId, flow.next!)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors btn-tactile ${flow.cls}`}
                              >
                                {flow.label}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setKotOrder(ord)}
                              className="p-1.5 rounded-lg border border-[rgba(53,23,15,0.15)] bg-white text-[#6E5147] hover:text-[#24100B] hover:border-[#F57C00] transition-colors shadow-sm"
                              title="Print KOT"
                            >
                              <Printer size={13} />
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

      {/* KOT Print Modal */}
      {kotOrder && (
        <KOTPrint order={kotOrder} onClose={() => setKotOrder(null)} />
      )}
    </AdminLayout>
  );
}
