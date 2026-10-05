'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order } from '@/types';
import { CheckCircle2, Clock, MapPin, Search, ArrowRight, X, PhoneCall, Sparkles, Receipt } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export default function OrderConfirmationModal({
  order,
  isOpen,
  onClose,
  onTrackOrder,
}: OrderConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C8281E', '#D97706', '#166534', '#FAF5ED', '#FBBF24'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formattedDate = new Date(order.menuDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#24100B]/80 transition-opacity backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-3xl bg-[#FAF5ED] text-left shadow-2xl transition-all w-full max-w-lg border-2 border-[#F4B400] animate-scale-in">
          
          {/* Top Celebration Banner */}
          <div className="p-6 bg-gradient-to-r from-[#C9281C] via-[#E33B24] to-[#24100B] text-[#FFF8EE] text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#F4B400] text-[#24100B] flex items-center justify-center shadow-lg border-2 border-white">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-[#FDE68A]">
              🎉 Feast Pre-Order Confirmed!
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
              Order Confirmed! 🌶️
            </h2>
            <p className="text-xs text-white/85 max-w-xs mx-auto mt-1">
              Our kitchen masters will cook your feast tomorrow dawn in authentic brass handis.
            </p>
          </div>

          {/* Order Details Body */}
          <div className="p-6 space-y-5">
            {/* Order Number & Target Slot */}
            <div className="p-4 rounded-2xl bg-white border border-[rgba(46,26,17,0.12)] flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">
                  Order Reference
                </span>
                <span className="font-display font-black text-2xl text-[#C9281C]">
                  #{order.orderNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#78716C] font-bold uppercase tracking-wider block">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-[#166534] bg-[#166534]/10 px-2.5 py-1 rounded-full border border-[#166534]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                  PAID ({order.paymentMethod})
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-4 rounded-xl bg-white border border-[rgba(46,26,17,0.08)] space-y-2 text-xs text-[#2E1A11] shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#2E1A11]">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>Delivery: {formattedDate} ({order.deliveryAddress?.deliverySlot || 'Standard'})</span>
              </div>
              <div className="flex items-start gap-2 text-[#5C3424]">
                <MapPin className="w-4 h-4 text-[#C9281C] shrink-0 mt-0.5" />
                <span>
                  {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="border-t border-b border-[rgba(46,26,17,0.08)] py-3 space-y-2">
              <div className="text-xs font-bold text-[#2E1A11] uppercase tracking-wider">
                Feast Items ({order.items?.length || 0})
              </div>
              {(order.items || []).map((it) => (
                <div key={it.foodItemId} className="flex justify-between items-center text-xs">
                  <span className="text-[#2E1A11] font-medium">
                    {it.quantity}× {it.name} ({it.unit})
                  </span>
                  <span className="font-bold text-[#2E1A11]">₹{it.itemTotal}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-baseline font-black text-sm text-[#2E1A11] border-t border-[rgba(46,26,17,0.08)]">
                <span>Total Paid</span>
                <span className="text-lg text-[#C9281C] font-display">₹{order.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(order.orderNumber);
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-sm shadow-md transition-all btn-tactile flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#D97706]" />
                <span>Track Order Live Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-[#2E1A11] font-bold text-xs hover:bg-[#FAF5ED] transition-colors text-center cursor-pointer"
              >
                Back to Kitchen Menu
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
