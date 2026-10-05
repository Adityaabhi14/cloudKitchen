'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order, OrderStatus } from '@/types';
import { api } from '@/services/api';
import { 
  Search, 
  CheckCircle2, 
  Flame, 
  Package, 
  Bike, 
  Check, 
  AlertCircle,
  MapPin,
  ArrowLeft
} from 'lucide-react';

const milestones: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', desc: 'Pre-order accepted & ingredients reserved', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Simmering at Dawn', desc: 'Slow-cooking in brass handis on wood-fire', icon: Flame },
  { status: 'READY', label: 'Freshly Packed', desc: 'Sealed hot in insulated containers', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', desc: 'Rider is on the way to your address', icon: Bike },
  { status: 'DELIVERED', label: 'Feast Delivered', desc: 'Delivered hot! Enjoy your authentic meal.', icon: Check },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [query, setQuery] = useState<string>(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');

    try {
      const clean = searchTerm.trim().replace('#', '');
      const res = await api.getOrderById(clean);

      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        const phoneRes = await api.getOrders({ phone: clean });
        if (phoneRes.success && phoneRes.data && phoneRes.data.length > 0) {
          setOrder(phoneRes.data[0]);
        } else {
          setOrder(null);
          setError(`No active order found for "${searchTerm}". Please check your order reference number.`);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'PENDING' || status === 'CONFIRMED') return 0;
    if (status === 'PREPARING') return 1;
    if (status === 'READY') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  const currentIndex = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6 space-y-2">
        <Link href="/" className="text-xs font-bold text-[#5C3424] hover:text-[#C8281E] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#2E1A11]">
          Track Your Feast Live
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] font-medium">
          Enter your Order ID (e.g. TEL-10482) or 10-digit mobile number to monitor preparation.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. TEL-10482 or 9876543210"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-sm font-bold text-[#2E1A11] focus:outline-none focus:border-[#C8281E]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer btn-tactile"
        >
          {loading ? 'Tracking...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-[#C8281E]/10 border border-[#C8281E]/20 text-[#C8281E] text-xs font-semibold flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Display */}
      {order && (
        <div className="bg-white rounded-2xl border border-[rgba(46,26,17,0.1)] p-6 space-y-6 shadow-sm">
          {/* Top Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(46,26,17,0.08)] pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
                Order Reference
              </span>
              <span className="font-display font-black text-2xl text-[#C8281E]">
                #{order.orderNumber}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
                Dining Date & Slot
              </span>
              <span className="font-bold text-sm text-[#2E1A11]">
                {order.menuDate} ({order.deliveryAddress?.deliverySlot || 'Standard'})
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-[#2E1A11]">
              Kitchen Preparation Status
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2E1A11]/10">
              {milestones.map((m, idx) => {
                const isDone = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                const Icon = m.icon;

                return (
                  <div key={m.status} className="relative flex items-start gap-3.5">
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#C8281E] text-white ring-4 ring-[#C8281E]/20'
                          : isDone
                          ? 'bg-[#166534] text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          isCurrent ? 'text-[#C8281E]' : isDone ? 'text-[#2E1A11]' : 'text-gray-400'
                        }`}>
                          {m.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#C8281E]/10 text-[#C8281E]">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[rgba(46,26,17,0.08)] space-y-2 text-xs">
            <div className="font-bold text-[#2E1A11] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C8281E]" />
              <span>Delivering to: {order.deliveryAddress?.fullName || order.customer?.name}</span>
            </div>
            <p className="text-[#5C3424] pl-5">
              {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </p>
            <div className="pt-2 border-t border-[rgba(46,26,17,0.08)] flex justify-between font-bold text-[#2E1A11]">
              <span>Items: {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
              <span className="text-[#C8281E] font-display text-sm">₹{order.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#FAF5ED] flex flex-col pt-[74px]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm font-bold">Loading order tracker...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
