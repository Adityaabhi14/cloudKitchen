'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Order, PaymentMethod, CustomerAddress } from '@/types';
import { api } from '@/services/api';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Lock,
  Sparkles,
  Home,
  Briefcase,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const DEFAULT_DELIVERY_SLOTS: string[] = [
  'Lunch (12:30 PM - 2:00 PM)',
  'Dinner (7:30 PM - 9:00 PM)',
  'Early Evening Tiffins (5:00 PM - 6:30 PM)',
];

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }: CheckoutModalProps) {
  const { cart, subtotal, deliveryFee, packagingFee, discount, total, selectedDate, clearCart, settings, appliedPromo } = useCart();
  const { user, openAuthModal } = useCustomerAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Extract delivery slots safely with layered fallbacks
  const deliverySlots: string[] = React.useMemo(() => {
    if (Array.isArray(settings?.deliverySlots) && settings.deliverySlots.length > 0) {
      return settings.deliverySlots;
    }
    if (Array.isArray((settings as any)?.delivery_slots) && (settings as any).delivery_slots.length > 0) {
      return (settings as any).delivery_slots;
    }
    return DEFAULT_DELIVERY_SLOTS;
  }, [settings]);

  // Form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [pincode, setPincode] = useState<string>('500034');
  const [city, setCity] = useState<string>('Hyderabad');
  const [deliverySlot, setDeliverySlot] = useState<string>(() => deliverySlots[0] || DEFAULT_DELIVERY_SLOTS[0]);
  const [cookingInstructions, setCookingInstructions] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Auto-fill logged-in customer info
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.email && !email) setEmail(user.email);

      // Default address auto-select
      if (Array.isArray(user.addresses) && user.addresses.length > 0 && !addressLine1) {
        const def = user.addresses.find((a) => a.isDefault || (a as any).is_default) || user.addresses[0];
        handleSelectSavedAddress(def);
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.id);
    if (addr.fullName || (addr as any).full_name) setName(addr.fullName || (addr as any).full_name);
    if (addr.phone) setPhone(addr.phone);
    const line = `${addr.houseFlat || (addr as any).house_flat || ''}, ${addr.street || ''}, ${addr.area || ''}`.replace(/^, /, '').trim();
    setAddressLine1(line);
    setPincode(addr.pincode || '500033');
    setCity(addr.city || 'Hyderabad');
    if (addr.instructions) setCookingInstructions(addr.instructions);
  };


  // Sync deliverySlot if settings load asynchronously or update
  React.useEffect(() => {
    if (deliverySlots.length > 0 && (!deliverySlot || !deliverySlots.includes(deliverySlot))) {
      setDeliverySlot(deliverySlots[0]);
    }
  }, [deliverySlots, deliverySlot]);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  if (!isOpen) return null;

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!addressLine1.trim()) {
      setErrorMessage('Please enter your complete street address');
      return;
    }
    if (!pincode.trim() || pincode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit Pincode');
      return;
    }

    setStep(2);
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Initialize payment order via server API service
      const payRes = await api.createPaymentOrder(total, {
        customerName: name,
        customerPhone: phone,
        menuDate: selectedDate,
      });

      if (!payRes.success || !payRes.orderId) {
        throw new Error(payRes.error || 'Payment initiation failed');
      }

      // Simulate payment network verification
      await new Promise((r) => setTimeout(r, 800));

      const mockPaymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: payRes.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'verified_sig_hash',
      });

      if (!verifyRes.success) {
        throw new Error('Payment verification failed');
      }

      // 2. Submit Order to Backend Database
      const orderPayload = {
        customer: {
          id: user?.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        deliveryAddress: {
          addressLine1: addressLine1.trim(),
          pincode: pincode.trim(),
          city: city.trim(),
          deliverySlot,
          cookingInstructions: cookingInstructions.trim() || undefined,
        },
        items: cart,
        appliedPromo,
        menuDate: selectedDate,
        paymentMethod,
        paymentStatus: 'PAID' as const,
        razorpayOrderId: payRes.orderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: 'verified_sig_hash',
      };

      const orderRes = await api.createOrder(orderPayload);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to place order');
      }

      clearCart();
      setIsProcessing(false);
      onClose();
      onOrderSuccess(orderRes.data);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#24100B]/75 transition-opacity backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-3xl bg-[#FAF5ED] text-left shadow-2xl transition-all w-full max-w-xl border border-[rgba(46,26,17,0.15)] animate-scale-in">
          
          {/* Header */}
          <div className="p-6 bg-[#24100B] text-[#FFF8EE] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9281C] to-[#F57C00] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
                వి
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-[#FFF8EE]">Confirm Feast Delivery</h3>
                <p className="text-xs text-[#F4B400] font-semibold">
                  Dining Date: <strong>{formattedDate}</strong>
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

          {/* Stepper Indicator */}
          <div className="bg-white px-6 py-3 border-b border-[rgba(46,26,17,0.08)] flex items-center justify-between text-xs font-bold text-[#6E5147]">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#C9281C]' : 'text-[#78716C]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step >= 1 ? 'bg-[#C9281C] font-bold' : 'bg-gray-300'}`}>
                1
              </span>
              <span>Delivery Details</span>
            </div>
            <span className="w-6 h-0.5 bg-[rgba(46,26,17,0.1)]" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#C9281C]' : 'text-[#78716C]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step >= 2 ? 'bg-[#C9281C] font-bold' : 'bg-gray-300'}`}>
                2
              </span>
              <span>Review Feast</span>
            </div>
            <span className="w-6 h-0.5 bg-[rgba(46,26,17,0.1)]" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#C9281C]' : 'text-[#78716C]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step >= 3 ? 'bg-[#C9281C] font-bold' : 'bg-gray-300'}`}>
                3
              </span>
              <span>Payment</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-[#C9281C]/10 border border-[#C9281C]/25 text-[#C9281C] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C9281C] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Address & Time Slot */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="p-6 space-y-4">
              {/* Google Sign In fast action if not logged in */}
              {!user ? (
                <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#F4B400]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-[#F4B400] flex-shrink-0" />
                    <span className="text-xs text-[#35170F] font-semibold">
                      Sign in with Google to prefill saved addresses & track orders!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#2E1A11]/15 text-xs font-bold text-[#C9281C] hover:bg-[#FFF3E0] transition-colors flex-shrink-0"
                  >
                    Google Sign In
                  </button>
                </div>
              ) : (
                user.addresses && user.addresses.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#2E1A11]/10 space-y-2">
                    <span className="text-[11px] font-bold text-[#78716C] uppercase flex items-center gap-1">
                      <MapPin size={12} className="text-[#C9281C]" />
                      Saved Delivery Addresses (1-Click Fill)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {user.addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#C9281C] text-white border-[#C9281C] shadow-sm'
                                : 'bg-white text-[#2E1A11] border-[#2E1A11]/15 hover:border-[#C9281C]'
                            }`}
                          >
                            {addr.label === 'Work' ? <Briefcase size={12} /> : <Home size={12} />}
                            <span>{addr.label}: {addr.area || addr.city}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2E1A11] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Varma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-bold text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2E1A11] mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-bold text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2E1A11] mb-1">
                  Email (for receipt)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-medium text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2E1A11]">
                  <MapPin className="w-3.5 h-3.5 text-[#C9281C]" />
                  <span>Street Address *</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat / House No., Apartment, Street name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-medium text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode *"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-medium text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                  />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-medium text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="pt-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2E1A11] mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Choose Meal Time Slot *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliverySlot(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        deliverySlot === slot
                          ? 'bg-[#2E1A11] text-[#FAF5ED] border-[#2E1A11] shadow-sm'
                          : 'bg-white text-[#2E1A11] border-[rgba(46,26,17,0.1)] hover:bg-[#FAF5ED]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2E1A11] mb-1">
                  Cooking Notes (Optional)
                </label>
                <input
                  type="text"
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  placeholder="e.g. Extra spicy, less oil, separate gravy"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-xs font-medium text-[#2E1A11] focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-xs sm:text-sm shadow-md transition-all btn-tactile flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Feast Order</span>
                  <ArrowRight className="w-4 h-4 text-[#D97706]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Review Feast */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-white border border-[rgba(46,26,17,0.1)] p-4 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between border-b border-[rgba(46,26,17,0.08)] pb-2">
                  <span className="font-bold text-[#2E1A11]">Recipient:</span>
                  <span className="font-semibold text-[#2E1A11]">{name} ({phone})</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(46,26,17,0.08)] pb-2">
                  <span className="font-bold text-[#2E1A11]">Delivery Slot:</span>
                  <span className="font-bold text-[#C8281E]">{deliverySlot}</span>
                </div>
                <div className="text-[#5C3424] pt-1">
                  {addressLine1}, {city} - {pincode}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {cart.map((it) => (
                  <div key={it.foodItemId} className="flex justify-between items-center text-xs py-1.5 border-b border-[rgba(46,26,17,0.06)] font-medium">
                    <span>{it.quantity}× {it.name} ({it.unit})</span>
                    <span className="font-bold text-[#2E1A11]">₹{it.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white border border-[rgba(46,26,17,0.1)] space-y-1.5 text-xs shadow-sm">
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
                <div className="pt-2 border-t border-[rgba(46,26,17,0.08)] flex justify-between items-baseline font-display font-black text-sm text-[#2E1A11]">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#C8281E]">₹{total}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-[#2E1A11] font-bold text-xs hover:bg-[#FAF5ED] cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] text-[#FAF5ED] font-bold text-xs shadow-md transition-all btn-tactile flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-white border border-[rgba(46,26,17,0.1)] rounded-xl text-xs font-bold text-[#2E1A11] shadow-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#166534]" />
                  <span>Secure 256-Bit Encrypted Payment</span>
                </div>
                <span className="text-base font-display font-black text-[#C8281E]">₹{total}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5">
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'UPI' ? 'border-[#C8281E] bg-white shadow-sm' : 'border-[rgba(46,26,17,0.1)] bg-[#FAF5ED]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#C8281E]" />
                      <span className="font-bold text-xs text-[#2E1A11]">Instant UPI (GPay, PhonePe, Paytm, QR)</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#166534] bg-[#166534]/10 px-2 py-0.5 rounded-md">Fastest</span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'CARD' ? 'border-[#C8281E] bg-white shadow-sm' : 'border-[rgba(46,26,17,0.1)] bg-[#FAF5ED]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#2E1A11]" />
                    <span className="font-bold text-xs text-[#2E1A11]">Credit / Debit Card (Visa, RuPay, MasterCard)</span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'NETBANKING' ? 'border-[#C8281E] bg-white shadow-sm' : 'border-[rgba(46,26,17,0.1)] bg-[#FAF5ED]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#2E1A11]" />
                    <span className="font-bold text-xs text-[#2E1A11]">Net Banking (All Indian Major Banks)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(46,26,17,0.08)]">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[rgba(46,26,17,0.15)] text-[#2E1A11] font-bold text-xs hover:bg-[#FAF5ED] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessPayment}
                  className="px-8 py-3.5 rounded-xl bg-[#2E1A11] hover:bg-[#5C3424] disabled:opacity-50 text-[#FAF5ED] font-bold text-sm shadow-md transition-all btn-tactile flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Authorizing ₹{total}...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#D97706]" />
                      <span>Authorize & Pay ₹{total}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
