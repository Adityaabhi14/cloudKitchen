'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import DateSelector from '@/components/DateSelector';
import FoodCard from '@/components/FoodCard';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileStickyCart from '@/components/MobileStickyCart';
import CheckoutModal from '@/components/CheckoutModal';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import OrderTrackerModal from '@/components/OrderTrackerModal';
import { useCart } from '@/context/CartContext';
import { DayMenu, FoodItem, Order } from '@/types';
import { api } from '@/services/api';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { selectedDate, isTrackModalOpen, setIsTrackModalOpen } = useCart();

  // Menu data state
  const [dayMenu, setDayMenu] = useState<DayMenu | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState<string>('');

  // Fetch Menu on Date Change
  useEffect(() => {
    fetchDayMenu(selectedDate);
  }, [selectedDate]);

  const fetchDayMenu = async (dateStr: string) => {
    setIsLoadingMenu(true);
    try {
      const res = await api.getMenu(dateStr);
      if (res.success && res.data) {
        setDayMenu(res.data);
      }
    } catch (err) {
      console.error('Failed to load day menu:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setConfirmedOrder(newOrder);
    setIsConfirmationOpen(true);
  };

  const handleOpenTrackingFromConfirmation = (orderNum: string) => {
    setTrackOrderNumber(orderNum);
    setIsConfirmationOpen(false);
    setIsTrackModalOpen(true);
  };

  // Categories list
  const categories = [
    'All',
    'Biryani & Pulao',
    'Curries & Pulusu',
    'Full Meals & Combos',
    'Tiffins & Breakfast',
    'Snacks & Starters',
    'Flavoured Rice',
    'Pachadi & Podi',
    'Sweets & Desserts',
    'Beverages',
  ];

  // Filter menu items
  const menuItems = (dayMenu as any)?.items || [];
  const filteredItems = menuItems.filter((mItem: any) => {
    const food = mItem.food as FoodItem;
    if (!food) return false;

    if (mItem.status === 'HIDDEN' || food.status === 'HIDDEN') return false;

    // Category
    if (selectedCategory !== 'All') {
      const matchCat = (food.category || (food as any).category_name || '')
        .toLowerCase()
        .includes(selectedCategory.split(' ')[0].toLowerCase());
      if (!matchCat) return false;
    }

    const isItemVeg = Boolean(food.isVeg || (food as any).is_veg === 1);
    if (vegFilter === 'VEG' && !isItemVeg) return false;
    if (vegFilter === 'NON_VEG' && isItemVeg) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = food.name.toLowerCase().includes(q);
      const telugu = food.teluguName || (food as any).telugu_name || '';
      const matchTelugu = telugu.toLowerCase().includes(q);
      const matchDesc = (food.description || '').toLowerCase().includes(q);
      if (!matchName && !matchTelugu && !matchDesc) return false;
    }

    return true;
  });

  const formattedMenuDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5ED] text-[#2E1A11]">
      {/* Fixed Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Daily Menu Section */}
        <section id="menu-section" className="py-16 sm:py-20">
          <div className="site-container">
            
            {/* Header & Date Controls */}
            <div className="space-y-6 mb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#C8281E] bg-[#C8281E]/10 border border-[#C8281E]/20 px-3.5 py-1 rounded-full inline-block">
                    Tomorrow&apos;s Grand Feast
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2E1A11] tracking-tight">
                    {dayMenu?.title || "Tomorrow's Handcrafted Menu"}
                  </h2>
                  <p className="text-sm text-[#78716C]">
                    Slow-cooked fresh for delivery on <strong className="text-[#2E1A11] font-bold">{formattedMenuDate}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchDayMenu(selectedDate)}
                  className="self-start md:self-auto text-xs font-semibold text-[#78716C] hover:text-[#C8281E] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(46,26,17,0.12)] bg-white cursor-pointer transition-colors btn-tactile shadow-sm"
                  title="Refresh Menu"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Menu</span>
                </button>
              </div>

              {/* Date Navigator */}
              <DateSelector />

              {/* Filter Controls Bar */}
              <div className="bg-white border border-[rgba(46,26,17,0.08)] rounded-2xl p-4 shadow-sm space-y-3">
                {/* Category pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all btn-tactile ${
                        selectedCategory === cat
                          ? 'bg-[#2E1A11] text-[#FAF5ED]'
                          : 'bg-[#2E1A11]/5 text-[#2E1A11] hover:bg-[#2E1A11]/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Secondary Filters: Veg Toggle + Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(46,26,17,0.06)]">
                  {/* Veg / Non-Veg Toggle */}
                  <div className="flex items-center rounded-xl bg-[#2E1A11]/5 p-1 border border-[#2E1A11]/10 w-fit">
                    {(['ALL', 'VEG', 'NON_VEG'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setVegFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          vegFilter === f
                            ? f === 'VEG'
                              ? 'bg-[#166534] text-white'
                              : f === 'NON_VEG'
                              ? 'bg-[#C8281E] text-white'
                              : 'bg-white text-[#2E1A11] shadow-sm'
                            : 'text-[#78716C] hover:text-[#2E1A11]'
                        }`}
                      >
                        {f === 'ALL' ? 'All Dishes' : f === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#78716C]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search biryani, kodi kura, pappu..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-[#2E1A11]/5 border border-[rgba(46,26,17,0.1)] text-[#2E1A11] placeholder-[#78716C] focus:outline-none focus:border-[#C8281E] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            {isLoadingMenu ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-[rgba(46,26,17,0.08)] bg-white">
                    <div className="aspect-[16/10] shimmer" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 shimmer rounded w-3/4" />
                      <div className="h-3 shimmer rounded w-1/2" />
                      <div className="h-3 shimmer rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(46,26,17,0.08)] max-w-md mx-auto p-6">
                <div className="text-4xl mb-3">🍲</div>
                <h3 className="font-display font-bold text-lg text-[#2E1A11] mb-1">
                  No dishes found
                </h3>
                <p className="text-xs sm:text-sm text-[#78716C] mb-4">
                  No items matched your current filters for {formattedMenuDate}.
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('All'); setVegFilter('ALL'); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-xl bg-[#2E1A11] text-[#FAF5ED] font-bold text-xs hover:bg-[#5C3424] transition-colors btn-tactile"
                >
                  Show All Dishes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((menuItem: any) => {
                  const food = menuItem.food as FoodItem;
                  const price = menuItem.price_override || menuItem.customPrice || food.price || (food as any).base_price;
                  const unit = menuItem.unit_override || menuItem.customUnit || food.unit || (food as any).default_unit;

                  return (
                    <FoodCard
                      key={menuItem.food_item_id || menuItem.foodItemId}
                      item={{
                        ...food,
                        price,
                        unit,
                        isVeg: Boolean(food.isVeg || (food as any).is_veg === 1),
                        imageUrl: food.imageUrl || (food as any).image_url,
                        spiceLevel: food.spiceLevel || (food as any).spice_level || 3,
                        teluguName: food.teluguName || (food as any).telugu_name,
                      }}
                      customPrice={price}
                      customUnit={unit}
                      menuStatus={menuItem.status}
                      remainingStock={menuItem.remaining_stock !== undefined ? menuItem.remaining_stock : menuItem.remainingStock}
                    />
                  );
                })}
              </div>
            )}

          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Heritage & Philosophy Section */}
        <section className="py-20 bg-[#2E1A11] text-[#FAF5ED]">
          <div className="site-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-5">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 px-3.5 py-1 rounded-full inline-block">
                  Authentic Culinary Heritage
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-[#FAF5ED] leading-tight">
                  Handcrafted in Traditional Heavy Brass Handis
                </h2>
                <p className="text-sm text-[#FAF5ED]/75 leading-relaxed">
                  In Andhra and Telangana homes, great curries cannot be rushed. Every morning at dawn, whole Guntur chillies and poppy seeds are stone-ground. No commercial purees. No preservatives. Made strictly against confirmed pre-orders.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xl mb-1">🥘</p>
                    <p className="text-sm font-bold text-[#D97706]">Brass Handis</p>
                    <p className="text-xs text-[#FAF5ED]/60 mt-0.5">Even heat distribution locks in natural juices</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xl mb-1">🌿</p>
                    <p className="text-sm font-bold text-[#D97706]">Cold-Pressed Oils</p>
                    <p className="text-xs text-[#FAF5ED]/60 mt-0.5">Unmistakable aroma of wood-pressed gingelly oil</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#FAF5ED] text-[#2E1A11] space-y-5 shadow-2xl">
                <h3 className="font-display font-black text-2xl text-[#2E1A11]">
                  Our Kitchen Promise
                </h3>
                <ul className="space-y-3.5">
                  {[
                    'Honest portion metrics — 500 g, 750 g, 1 kg guaranteed net weight',
                    'Sealed piping hot in food-grade insulated containers',
                    '100% freshly cooked at dawn — zero day-old reheating',
                    'Exclusive Telangana & Andhra heritage recipes',
                  ].map((promiseText) => (
                    <li key={promiseText} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2E1A11] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                      <span>{promiseText}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#menu-section"
                  className="block w-full text-center py-3.5 rounded-xl bg-[#2E1A11] text-[#FAF5ED] font-bold text-sm hover:bg-[#5C3424] transition-colors btn-tactile shadow-md"
                >
                  Explore Tomorrow&apos;s Feast
                </a>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Mobile Sticky Cart Trigger */}
      <MobileStickyCart />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onTrackOrder={handleOpenTrackingFromConfirmation}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialOrderNumber={trackOrderNumber}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
