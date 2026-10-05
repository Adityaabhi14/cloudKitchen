'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FoodItem, ItemStatus } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Check } from 'lucide-react';

interface FoodCardProps {
  item: FoodItem;
  customPrice?: number;
  customUnit?: string;
  menuStatus?: ItemStatus;
  remainingStock?: number;
}

export default function FoodCard({
  item,
  customPrice,
  customUnit,
  menuStatus,
  remainingStock,
}: FoodCardProps) {
  const { cart, addToCart } = useCart();
  const [qty,   setQty]   = useState<number>(1);
  const [added, setAdded] = useState(false);

  const price  = customPrice !== undefined ? customPrice : item.price;
  const unit   = customUnit  || item.unit;
  const status = menuStatus  || item.status;
  const stock  = remainingStock !== undefined ? remainingStock : item.remainingStock;

  const isSoldOut  = status === 'SOLD_OUT'  || stock <= 0;
  const isLowStock = status === 'LOW_STOCK' || (stock > 0 && stock <= 4);

  const inCartItem = cart.find((c) => c.foodItemId === item.id);
  const inCartQty  = inCartItem?.quantity || 0;

  const handleAdd = () => {
    if (isSoldOut) return;
    addToCart(item, qty, price, unit);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className={`food-card ${isSoldOut ? 'opacity-65 grayscale-[30%]' : ''}`}>
      
      {/* ── Image with Overlay Badge ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#2E1A11]/5">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />

        {/* Diet Type Dot (FSSAI style badge) */}
        <div className="absolute top-3 left-3 bg-white/95 rounded-md p-1 shadow-sm flex items-center justify-center">
          {item.isVeg ? <span className="veg-dot" /> : <span className="nonveg-dot" />}
        </div>

        {/* Low Stock / Sold Out tag only if applicable */}
        {isSoldOut ? (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 text-white text-[10px] font-black uppercase tracking-wider">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#D97706] text-white text-[10px] font-bold uppercase">
            Only {stock} left
          </div>
        ) : null}

        {/* In Cart Indicator */}
        {inCartQty > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#166534] text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
            <span>In Cart: {inCartQty}</span>
          </div>
        )}
      </div>

      {/* ── Card Content Body ── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Food Title & Telugu name */}
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-display font-bold text-base text-[#2E1A11] leading-snug line-clamp-1">
              {item.name}
            </h3>
          </div>
          
          {item.teluguName && (
            <p
              className="text-[11px] text-[#78716C] font-medium mt-0.5"
              style={{ fontFamily: 'var(--font-telugu)' }}
            >
              {item.teluguName}
            </p>
          )}

          {/* Short description */}
          <p className="text-xs text-[#5C3424]/80 line-clamp-2 leading-relaxed mt-1.5">
            {item.description}
          </p>
        </div>

        {/* ── Price & Purchase Controls ── */}
        <div className="mt-4 pt-3 border-t border-[rgba(46,26,17,0.07)]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-[#2E1A11]">₹{price}</span>
              <span className="text-xs text-[#78716C] font-medium">/ {unit}</span>
            </div>
          </div>

          {isSoldOut ? (
            <button
              disabled
              className="w-full py-2 rounded-xl bg-gray-100 text-gray-400 font-semibold text-xs cursor-not-allowed"
            >
              Sold Out For Today
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex items-center rounded-xl bg-[#2E1A11]/5 border border-[#2E1A11]/10 p-0.5">
                <button
                  type="button"
                  onClick={() => setQty((p) => Math.max(1, p - 1))}
                  disabled={qty <= 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2E1A11] hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-[#2E1A11]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((p) => Math.min(item.maxOrderQty || 10, p + 1))}
                  disabled={qty >= (item.maxOrderQty || 10)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2E1A11] hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all btn-tactile ${
                  added
                    ? 'bg-[#166534] text-white'
                    : 'bg-[#2E1A11] text-[#FAF5ED] hover:bg-[#5C3424]'
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} />
                    <span>Added</span>
                  </>
                ) : (
                  <span>Add to Feast</span>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
