'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Package, 
  Bike, 
  Check, 
  AlertCircle,
  PhoneCall,
  MapPin,
  Calendar
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

const statusMilestones: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', desc: 'Pre-order accepted & ingredients reserved', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Simmering at Dawn', desc: 'Slow-cooking in brass handis on wood-fire', icon: Flame },
  { status: 'READY', label: 'Freshly Packed', desc: 'Sealed hot in insulated eco-friendly containers', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', desc: 'Delivery partner on way to your address', icon: Bike },
  { status: 'DELIVERED', label: 'Feast Delivered', desc: 'Enjoy your authentic home-style meal!', icon: Check },
];

export default function OrderTrackerModal({
  isOpen,
  onClose,
  initialOrderNumber = '',
}: OrderTrackerModalProps) {
  const [query, setQuery] = useState<string>(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialOrderNumber && isOpen) {
      setQuery(initialOrderNumber);
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber, isOpen]);

  if (!isOpen) return null;

  const fetchOrder = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Clean order number (e.g. TEL-10482) or phone lookup
      const clean = searchStr.trim().replace('#', '');
      const res = await fetch(`/api/orders/${clean}`);
      const data = await res.json();

      if (data.success && data.data) {
        setSearchedOrder(data.data);
      } else {
        // Fallback search by phone
        const phoneRes = await fetch(`/api/orders?phone=${clean}`);
        const phoneData = await phoneRes.json();
        if (phoneData.success && phoneData.data && phoneData.data.length > 0) {
          setSearchedOrder(phoneData.data[0]);
        } else {
          setSearchedOrder(null);
          setErrorMessage(`No active order found for "${searchStr}". Check order ID or mobile number.`);
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error tracking order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'PENDING' || status === 'CONFIRMED') return 0;
    if (status === 'PREPARING') return 1;
    if (status === 'READY') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  const currentIndex = searchedOrder ? getStepIndex(searchedOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#24100B]/80 transition-opacity backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-3xl bg-[#FAF5ED] text-left shadow-2xl transition-all w-full max-w-xl border border-[rgba(46,26,17,0.15)] animate-scale-in">
          
          {/* Header */}
          <div className="p-6 bg-[#24100B] text-[#FFF8EE] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9281C] to-[#F57C00] text-white flex items-center justify-center font-bold shadow-md">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-[#FFF8EE]">Track Feast Live</h3>
                <p className="text-xs text-[#F4B400] font-semibold">
                  Real-time preparation updates from the kitchen
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#C4AEA5] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-6 border-b border-[rgba(46,26,17,0.08)] bg-white">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. TEL-10482) or Phone"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5ED] border border-[rgba(46,26,17,0.15)] text-sm font-bold text-[#2E1A11] placeholder-[#78716C] focus:outline-none focus:border-[#C9281C]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-xs shadow-md transition-all btn-tactile disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Searching...' : 'Track'}
              </button>
            </form>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-[#C9281C]/10 border border-[#C9281C]/25 text-[#C9281C] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#C9281C] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Order Details & Stepper */}
          {searchedOrder ? (
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Order Info Card */}
              <div className="p-4 rounded-2xl bg-white border border-[rgba(46,26,17,0.1)] flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    Order Reference
                  </div>
                  <div className="font-display font-black text-xl text-[#C9281C]">
                    #{searchedOrder.orderNumber}
                  </div>
                  <div className="text-xs text-[#5C3424] font-medium mt-0.5">
                    For {searchedOrder.customer?.name} ({searchedOrder.customer?.phone})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    Dining Date
                  </div>
                  <div className="text-sm font-bold text-[#2E1A11]">
                    {searchedOrder.menuDate}
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[rgba(46,26,17,0.1)] text-[#2E1A11]">
                    {searchedOrder.deliveryAddress?.deliverySlot || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Visual Animated Milestone Stepper */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-base text-[#2E1A11]">
                  Kitchen Progress Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[rgba(46,26,17,0.1)]">
                  {statusMilestones.map((m, idx) => {
                    const isDone = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    const Icon = m.icon;

                    return (
                      <div key={m.status} className="relative flex items-start gap-3.5">
                        <div
                          className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isCurrent
                              ? 'bg-[#C9281C] text-white ring-4 ring-[#C9281C]/20'
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
                              isCurrent ? 'text-[#C9281C]' : isDone ? 'text-[#2E1A11]' : 'text-[#78716C]'
                            }`}>
                              {m.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#C9281C]/10 text-[#C9281C]">
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

              {/* Items & Address */}
              <div className="p-4 rounded-xl bg-white border border-[rgba(46,26,17,0.1)] space-y-2 text-xs shadow-sm">
                <div className="font-bold text-[#2E1A11] flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C9281C]" />
                  <span>Delivering to:</span>
                </div>
                <p className="text-[#5C3424] font-medium pl-5">
                  {searchedOrder.deliveryAddress?.addressLine1}, {searchedOrder.deliveryAddress?.city} - {searchedOrder.deliveryAddress?.pincode}
                </p>

                <div className="pt-2 border-t border-[rgba(46,26,17,0.08)] flex justify-between font-bold text-[#2E1A11]">
                  <span>Items: {(searchedOrder.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
                  <span className="text-[#C9281C] font-display text-sm">₹{searchedOrder.total}</span>
                </div>
              </div>

              {/* Kitchen Assistance CTA */}
              <div className="p-3 bg-white border border-[rgba(46,26,17,0.1)] rounded-xl flex items-center justify-between text-xs text-[#2E1A11] font-medium shadow-sm">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#D97706]" />
                  <span>Need help with your order?</span>
                </div>
                <a
                  href="tel:+919876543210"
                  className="font-bold text-[#C9281C] hover:underline"
                >
                  Call Chef Desk
                </a>
              </div>

            </div>
          ) : (
            <div className="p-10 text-center text-[#78716C] space-y-2">
              <div className="text-4xl">🛵</div>
              <p className="text-xs font-medium max-w-xs mx-auto">
                Enter your order ID from your confirmation message or your 10-digit mobile number to track preparation.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
