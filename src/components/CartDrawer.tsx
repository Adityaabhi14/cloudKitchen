'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export default function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    packagingFee,
    discount,
    appliedPromo,
    applyPromo,
    removePromo,
    total,
    selectedDate,
    settings,
  } = useCart();

  const [promoInput,   setPromoInput]   = useState<string>('');
  const [promoError,   setPromoError]   = useState<string>('');
  const [promoSuccess, setPromoSuccess] = useState<string>('');

  if (!isCartOpen) return null;

  const formattedMenuDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const freeThreshold = settings?.freeDeliveryThreshold || 500;
  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;

    const ok = applyPromo(promoInput.trim());
    if (ok) {
      setPromoSuccess(`Coupon '${promoInput.toUpperCase()}' applied!`);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon. Try VINDU10 or VINDUFIRST');
    }
  };

  const handleProceed = () => {
    setIsCartOpen(false);
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF5ED] border-l border-[rgba(46,26,17,0.12)] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[rgba(46,26,17,0.08)] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2E1A11] text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4 text-[#D97706]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-[#2E1A11]">Your Feast Basket</h2>
                <div className="text-[11px] font-semibold text-[#78716C] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C8281E]" />
                  <span>Fulfillment: {formattedMenuDate}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-[#78716C] hover:bg-[#2E1A11]/5 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Free Delivery Bar */}
            {subtotal > 0 && (
              <div className="bg-white border border-[rgba(46,26,17,0.08)] rounded-xl p-3 text-xs shadow-sm">
                <div className="flex items-center justify-between font-bold text-[#2E1A11] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#D97706]" />
                    {amountNeededForFreeDelivery === 0 ? (
                      <span className="text-[#166534]">FREE Delivery Unlocked! 🎉</span>
                    ) : (
                      <span>Add ₹{amountNeededForFreeDelivery} more for <strong>FREE delivery</strong></span>
                    )}
                  </span>
                  <span>{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#166534] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[rgba(46,26,17,0.08)] flex items-center justify-center text-3xl shadow-sm">
                  🍲
                </div>
                <h3 className="font-display font-bold text-lg text-[#2E1A11]">Your feast basket is empty</h3>
                <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                  Explore tomorrow&apos;s handcrafted specials and add authentic Andhra and Telangana dishes.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#2E1A11] text-[#FAF5ED] font-bold text-xs hover:bg-[#5C3424] transition-colors btn-tactile shadow"
                >
                  Browse Tomorrow&apos;s Menu
                </button>
              </div>
            ) : (
              /* Items List */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#78716C] uppercase tracking-wider pb-1">
                  <span>Selected Dishes ({cart.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-[#C8281E] hover:text-[#9B1D15] font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.foodItemId}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[rgba(46,26,17,0.08)] shadow-sm"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#2E1A11] shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.isVeg ? <span className="veg-dot" /> : <span className="nonveg-dot" />}
                        <h4 className="font-bold text-xs sm:text-sm text-[#2E1A11] truncate">
                          {item.name}
                        </h4>
                      </div>

                      <div className="text-xs text-[#78716C] mt-0.5 font-medium">
                        ₹{item.price} / {item.unit}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center rounded-lg bg-[#2E1A11]/5 border border-[#2E1A11]/10 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#2E1A11] hover:bg-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#2E1A11]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#2E1A11] hover:bg-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-display font-bold text-sm text-[#2E1A11]">
                          ₹{item.itemTotal}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.foodItemId)}
                      className="p-1 text-[#78716C] hover:text-[#C8281E] transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Promo Coupon Form */}
                <div className="pt-2">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#166534]/10 border border-[#166534]/25 text-[#166534] text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#166534]" />
                        Code &apos;{appliedPromo}&apos; (-₹{discount})
                      </span>
                      <button
                        onClick={removePromo}
                        className="text-[#C8281E] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Promo code (e.g. VINDUFIRST)"
                          className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[rgba(46,26,17,0.15)] uppercase font-semibold text-[#2E1A11] focus:outline-none focus:border-[#C8281E]"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-[#2E1A11] text-[#FAF5ED] text-xs font-bold rounded-xl hover:bg-[#5C3424] cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-[11px] text-[#C8281E] font-semibold">{promoError}</p>}
                      {promoSuccess && <p className="text-[11px] text-[#166534] font-semibold">{promoSuccess}</p>}
                    </form>
                  )}
                </div>

                {/* Bill Summary */}
                <div className="p-4 rounded-xl bg-white border border-[rgba(46,26,17,0.08)] space-y-2 text-xs font-medium text-[#5C3424] shadow-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#2E1A11]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-[#2E1A11]">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging & Handi Seal</span>
                    <span className="font-bold text-[#2E1A11]">₹{packagingFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#166534] font-bold">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[rgba(46,26,17,0.08)] flex justify-between items-baseline font-display font-black text-base text-[#2E1A11]">
                    <span>Total Amount</span>
                    <span className="text-xl text-[#C8281E]">₹{total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[rgba(46,26,17,0.08)] bg-white space-y-2.5">
              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-sm shadow-md transition-all btn-tactile flex items-center justify-between cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#D97706] font-display text-base">₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
                <span>Encrypted Razorpay & UPI Gateway</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
