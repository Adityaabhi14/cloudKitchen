'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function MobileStickyCart() {
  const { itemCount, total, setIsCartOpen } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 animate-slide-up">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full py-3.5 px-5 rounded-2xl bg-chilli-600 hover:bg-chilli-700 text-cream-50 font-bold shadow-chilli-glow flex items-center justify-between transition-all btn-tactile border-2 border-turmeric-400"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-turmeric-500 text-tamarind-950 flex items-center justify-center font-black text-sm">
            {itemCount}
          </div>
          <div className="text-left">
            <div className="text-[11px] font-medium text-cream-200 uppercase tracking-wider leading-tight">
              Feast Subtotal
            </div>
            <div className="text-base font-black font-serif leading-tight">
              ₹{total}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-chilli-700/80 px-3 py-1.5 rounded-xl">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
