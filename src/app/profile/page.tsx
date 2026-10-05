'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerAuthModal from '@/components/CustomerAuthModal';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/services/api';
import { Order, CustomerAddress } from '@/types';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PENDING: { label: 'Order Placed', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', border: 'border-[#FFE0B2]' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]', border: 'border-[#FFECB3]' },
  PREPARING: { label: 'Slow-Cooking in Handi', bg: 'bg-[#FFEBEE]', text: 'text-[#C9281C]', border: 'border-[#FFCDD2]' },
  READY: { label: 'Packed & Ready', bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  DELIVERED: { label: 'Delivered', bg: 'bg-[#E8F5E9]', text: 'text-[#1B5E20]', border: 'border-[#A5D6A7]' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-[#F5F5F5]', text: 'text-[#757575]', border: 'border-[#E0E0E0]' },
};

export default function CustomerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const {
    user,
    isLoading,
    openAuthModal,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    toggleFavorite,
    deleteAccount,
  } = useCustomerAuth();

  const { addToCart, setIsCartOpen, setIsTrackModalOpen } = useCart();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteDishes, setFavoriteDishes] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Edit Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotif, setEditNotif] = useState(true);
  const [editMkt, setEditMkt] = useState(true);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrCity, setAddrCity] = useState('Hyderabad');
  const [addrState, setAddrState] = useState('Telangana');
  const [addrPincode, setAddrPincode] = useState('500033');
  const [addrInstructions, setAddrInstructions] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Danger Zone delete confirm modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sync profile edits
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditNotif(user.notificationsEnabled !== false);
      setEditMkt(user.marketingEnabled !== false);
    }
  }, [user]);

  // Load orders & favorites
  useEffect(() => {
    if (user) {
      loadCustomerOrders();
      loadFavorites();
    }
  }, [user]);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/auth/customer/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to load customer orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await api.getFoodItems();
      if (res.success && Array.isArray(res.data) && user?.favorites) {
        const favs = res.data.filter((dish) => user.favorites.includes(dish.id));
        setFavoriteDishes(favs);
      }
    } catch (e) {
      console.error('Failed to load favorite items:', e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({
      name: editName,
      phone: editPhone,
      notificationsEnabled: editNotif,
      marketingEnabled: editMkt,
    });
    if (ok) {
      setIsEditingProfile(false);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrFullName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrHouse('');
    setAddrStreet('');
    setAddrArea('');
    setAddrCity('Hyderabad');
    setAddrState('Telangana');
    setAddrPincode('500033');
    setAddrInstructions('');
    setAddrIsDefault(user?.addresses?.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || 'Home');
    setAddrFullName(addr.fullName || (addr as any).full_name || '');
    setAddrPhone(addr.phone || '');
    setAddrHouse(addr.houseFlat || (addr as any).house_flat || '');
    setAddrStreet(addr.street || '');
    setAddrArea(addr.area || '');
    setAddrCity(addr.city || 'Hyderabad');
    setAddrState(addr.state || 'Telangana');
    setAddrPincode(addr.pincode || '500033');
    setAddrInstructions(addr.instructions || '');
    setAddrIsDefault(Boolean(addr.isDefault || (addr as any).is_default));
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      houseFlat: addrHouse,
      street: addrStreet,
      area: addrArea,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      instructions: addrInstructions,
      isDefault: addrIsDefault,
    };

    if (editingAddressId) {
      await updateAddress(editingAddressId, payload);
    } else {
      await addAddress(payload);
    }
    setIsAddressModalOpen(false);
  };

  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmText.trim().toLowerCase() === 'delete') {
      await deleteAccount();
      setIsDeleteModalOpen(false);
    }
  };

  // If loading session, show pleasant spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF5ED] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#C9281C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#35170F]">Loading your Vindu Ruchulu profile...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show elegant login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF5ED] flex flex-col justify-between">
        <Navbar />
        <main className="pt-28 pb-16 site-container max-w-xl mx-auto text-center px-4">
          <div className="p-8 md:p-10 rounded-3xl bg-[#FFF8EE] border border-[#2E1A11]/10 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9281C] to-[#E65100] flex items-center justify-center mx-auto shadow-md shadow-[#C9281C]/20">
              <Flame size={32} className="text-white fill-white/20" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-[#2E1A11] tracking-tight">
                Customer Account
              </h1>
              <p className="text-sm text-[#78716C] mt-2 font-medium">
                Sign in with Google to view your order history, live order tracking, saved Hyderabad delivery addresses, and favourite dishes.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('/profile')}
              className="w-full h-12 rounded-2xl bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all btn-tactile"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="pt-2 text-xs text-[#78716C]">
              Looking for something delicious?{' '}
              <Link href="/#menu-section" className="font-bold text-[#C9281C] hover:underline">
                Explore Tomorrow&apos;s Menu →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <CustomerAuthModal />
      </div>
    );
  }

  const memberSinceStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'October 2026';

  return (
    <div className="min-h-screen bg-[#FAF5ED] flex flex-col justify-between selection:bg-[#F4B400] selection:text-[#35170F]">
      <Navbar />

      <main className="pt-24 pb-20 site-container max-w-6xl mx-auto px-4 md:px-6">
        {/* Profile Header Banner */}
        <section className="mt-4 rounded-3xl bg-gradient-to-br from-[#35170F] to-[#5C3424] text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle decorative texture */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#C9281C]/20 to-[#F4B400]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                <img
                  src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-[#FFD54F]/40 shadow-lg bg-[#FAF5ED]"
                />
                <span
                  className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow border border-gray-200"
                  title="Google Account Connected"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-[#FAF5ED]">
                    {user.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2E7D32]/30 text-[#A5D6A7] border border-[#2E7D32]/40">
                    <ShieldCheck size={12} /> Google Verified
                  </span>
                </div>
                <p className="text-sm text-white/80 font-medium mt-0.5">{user.email}</p>
                <div className="flex items-center gap-4 text-xs text-white/60 font-medium mt-2">
                  <span>Member since {memberSinceStr}</span>
                  <span>•</span>
                  <span>{orders.length} Feasts Ordered</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditingProfile(true);
                }}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#FFF8EE]/10 hover:bg-[#FFF8EE]/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </section>

        {/* Feedback alert on save */}
        {profileSaveSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>Your profile changes and communication preferences were saved successfully!</span>
          </div>
        )}

        {/* Tabs & Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-1.5">
            {[
              { id: 'profile', label: 'Personal Information', icon: User },
              { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length },
              { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, badge: user.addresses?.length },
              { id: 'favorites', label: 'Favourites', icon: Heart, badge: user.favorites?.length },
              { id: 'settings', label: 'Account Settings', icon: Settings },
              { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? tab.danger
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-[#C9281C] text-white shadow-md shadow-[#C9281C]/20'
                      : tab.danger
                      ? 'text-red-700 hover:bg-red-50'
                      : 'text-[#35170F] bg-white hover:bg-[#FFF3E0] border border-[#2E1A11]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#FAF5ED] text-[#C9281C]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'profile' && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#FFF8EE] border border-[#2E1A11]/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#2E1A11]/10 pb-4">
                  <div>
                    <h2 className="font-display font-black text-xl text-[#2E1A11]">
                      Personal Information
                    </h2>
                    <p className="text-xs text-[#78716C] mt-0.5">
                      Your identity and contact information for order confirmation & dispatch.
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 rounded-xl bg-[#2E1A11] text-white text-xs font-bold hover:bg-[#5C3424] transition-colors"
                    >
                      Edit Info
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/5 space-y-1">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase">Full Name</span>
                      <div className="text-sm font-bold text-[#2E1A11]">{user.name}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/5 space-y-1">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-[#2E7D32] font-semibold">Google Synced</span>
                      </span>
                      <div className="text-sm font-bold text-[#2E1A11]">{user.email}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/5 space-y-1">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase">Phone Number</span>
                      <div className="text-sm font-bold text-[#2E1A11]">
                        {user.phone || <span className="text-[#A8A29E] italic">Not added yet</span>}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/5 space-y-1">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase">Account Security</span>
                      <div className="text-sm font-bold text-[#2E7D32] flex items-center gap-1.5">
                        <ShieldCheck size={16} /> Google OAuth 2.0 Protected
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#35170F] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-semibold focus:outline-none focus:border-[#C9281C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#35170F] mb-1">
                        Phone Number (for Delivery Updates)
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 98490 12345"
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-semibold focus:outline-none focus:border-[#C9281C]"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 space-y-3">
                      <span className="text-xs font-bold text-[#35170F] block">
                        Communication Preferences
                      </span>
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-[#2E1A11]">
                        <input
                          type="checkbox"
                          checked={editNotif}
                          onChange={(e) => setEditNotif(e.target.checked)}
                          className="w-4 h-4 rounded text-[#C9281C] accent-[#C9281C]"
                        />
                        <span>Receive morning cooking & dispatch updates</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-[#2E1A11]">
                        <input
                          type="checkbox"
                          checked={editMkt}
                          onChange={(e) => setEditMkt(e.target.checked)}
                          className="w-4 h-4 rounded text-[#C9281C] accent-[#C9281C]"
                        />
                        <span>Receive festive feast announcements & weekly specials</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2.5 rounded-xl bg-[#FAF5ED] border border-[#2E1A11]/20 text-xs font-bold text-[#2E1A11]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#C9281C] hover:bg-[#A31F16] text-white text-xs font-bold transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-[#2E1A11]">Order History</h2>
                    <p className="text-xs text-[#78716C]">
                      Track active feasts and re-order your Telugu culinary favourites.
                    </p>
                  </div>
                  <Link
                    href="/#menu-section"
                    className="px-4 py-2 rounded-xl bg-[#C9281C] text-white text-xs font-bold hover:bg-[#A31F16] transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Pre-order Tomorrow&apos;s Feast
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-[#2E1A11]/10">
                    <div className="w-8 h-8 border-2 border-[#C9281C] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#78716C] mt-2">Fetching your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-10 text-center bg-white rounded-3xl border border-[#2E1A11]/10 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] flex items-center justify-center mx-auto text-[#E65100]">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#2E1A11]">No Orders Yet</h3>
                      <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1">
                        You haven&apos;t placed any orders yet. Check out tomorrow&apos;s slow-cooked Andhra & Telangana specials!
                      </p>
                    </div>
                    <Link
                      href="/#menu-section"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9281C] text-white text-xs font-bold hover:bg-[#A31F16] transition-colors"
                    >
                      Browse Feast Menu →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const statusConfig = ORDER_STATUS_MAP[ord.orderStatus || (ord as any).order_status] || ORDER_STATUS_MAP.PENDING;
                      const orderNum = ord.orderNumber || (ord as any).order_number || ord.id;
                      const items = ord.items || [];
                      const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

                      return (
                        <div
                          key={ord.id}
                          className="p-5 md:p-6 rounded-3xl bg-white border border-[#2E1A11]/10 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E1A11]/5 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-black text-base text-[#2E1A11]">
                                  #{orderNum}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                >
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#78716C] mt-0.5">
                                Dining Date: <strong className="text-[#35170F]">{ord.menuDate || (ord as any).menu_date}</strong> • Slot: {ord.deliveryAddress?.deliverySlot || (ord as any).delivery_slot || 'Lunch (12:30 PM - 2:00 PM)'}
                              </div>
                            </div>

                            <div className="text-right flex items-center justify-between sm:block">
                              <span className="font-display font-black text-lg text-[#2E1A11]">
                                ₹{ord.total || (ord as any).total_amount || 0}
                              </span>
                              <div className="text-[10px] font-bold text-[#2E7D32]">
                                {(ord.paymentStatus || (ord as any).payment_status) === 'PAID' ? '✓ Paid' : 'Payment Pending'}
                              </div>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-2">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-[#2E1A11] font-semibold">
                                  {item.quantity} × {item.name || (item as any).food_name}
                                </span>
                                <span className="text-[#78716C] font-bold">
                                  ₹{item.itemTotal || (item as any).item_total || 0}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Action footer */}
                          <div className="pt-2 flex items-center justify-between border-t border-[#2E1A11]/5">
                            <span className="text-[11px] text-[#78716C] font-medium">
                              {itemCount} {itemCount === 1 ? 'portion' : 'portions'} ordered
                            </span>
                            <button
                              onClick={() => setIsTrackModalOpen(true)}
                              className="px-4 py-1.5 rounded-xl bg-[#FFF8EE] hover:bg-[#FFF3E0] border border-[#2E1A11]/15 text-xs font-bold text-[#C9281C] flex items-center gap-1.5 transition-colors"
                            >
                              Track Live Order →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DELIVERY ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#FFF8EE] border border-[#2E1A11]/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#2E1A11]/10 pb-4">
                  <div>
                    <h2 className="font-display font-black text-xl text-[#2E1A11]">
                      Delivery Addresses
                    </h2>
                    <p className="text-xs text-[#78716C] mt-0.5">
                      Save multiple delivery points across Jubilee Hills, Banjara Hills, Madhapur, Gachibowli, etc.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2 rounded-xl bg-[#C9281C] text-white text-xs font-bold hover:bg-[#A31F16] transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#2E1A11]/10 space-y-3">
                    <MapPin size={28} className="text-[#C9281C] mx-auto" />
                    <p className="text-xs font-bold text-[#78716C]">
                      No saved addresses yet. Add your home or office address for 1-click checkout!
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 rounded-xl bg-[#2E1A11] text-white text-xs font-bold"
                    >
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => {
                      const isDef = Boolean(addr.isDefault || (addr as any).is_default);
                      return (
                        <div
                          key={addr.id}
                          className={`p-5 rounded-2xl bg-white border transition-all relative ${
                            isDef ? 'border-[#C9281C] shadow-sm' : 'border-[#2E1A11]/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5ED] text-[#35170F] border border-[#2E1A11]/10">
                              {addr.label === 'Work' ? <Briefcase size={12} /> : <Home size={12} />}
                              {addr.label}
                            </span>
                            {isDef && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#2E7D32]/15 text-[#2E7D32]">
                                ★ Default
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-[#2E1A11]">
                            <div className="font-bold text-sm">
                              {addr.fullName || (addr as any).full_name}
                            </div>
                            <div className="text-[#78716C]">
                              {addr.houseFlat || (addr as any).house_flat}, {addr.street}, {addr.area}
                            </div>
                            <div className="text-[#78716C]">
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </div>
                            <div className="text-[#35170F] font-semibold mt-1">
                              Phone: {addr.phone}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#2E1A11]/5 flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditAddress(addr)}
                                className="text-[#C9281C] hover:underline"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">•</span>
                              <button
                                onClick={() => deleteAddress(addr.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>

                            {!isDef && (
                              <button
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-[#2E1A11] hover:underline text-[11px]"
                              >
                                Set as default
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FAVOURITES */}
            {activeTab === 'favorites' && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#FFF8EE] border border-[#2E1A11]/10 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-[#2E1A11]">
                    Favourite Dishes
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Your marked culinary favourites from traditional Telangana & Andhra recipes.
                  </p>
                </div>

                {favoriteDishes.length === 0 ? (
                  <div className="p-10 text-center bg-white rounded-3xl border border-[#2E1A11]/10 space-y-3">
                    <Heart size={28} className="text-[#C9281C] mx-auto" />
                    <h3 className="font-bold text-sm text-[#2E1A11]">No Favourites Yet</h3>
                    <p className="text-xs text-[#78716C]">
                      Click the heart icon on any recipe on the feast menu to bookmark it here!
                    </p>
                    <Link
                      href="/#menu-section"
                      className="inline-block px-4 py-2 rounded-xl bg-[#C9281C] text-white text-xs font-bold"
                    >
                      Browse Tomorrow&apos;s Menu →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteDishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="p-4 rounded-2xl bg-white border border-[#2E1A11]/10 shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex gap-3">
                          <img
                            src={dish.imageUrl || dish.image_url}
                            alt={dish.name}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-[#2E1A11] line-clamp-1">
                              {dish.name}
                            </span>
                            <div className="text-[11px] font-bold text-[#C9281C]">
                              ₹{dish.price || dish.base_price} / {dish.unit || dish.default_unit}
                            </div>
                            <p className="text-[11px] text-[#78716C] line-clamp-2">
                              {dish.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#2E1A11]/5 flex items-center justify-between">
                          <button
                            onClick={() => toggleFavorite(dish.id)}
                            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                          <button
                            onClick={() => addToCart(dish, 1)}
                            className="px-3 py-1.5 rounded-xl bg-[#C9281C] text-white text-xs font-bold hover:bg-[#A31F16] transition-colors flex items-center gap-1"
                          >
                            <Plus size={12} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ACCOUNT SETTINGS */}
            {activeTab === 'settings' && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#FFF8EE] border border-[#2E1A11]/10 shadow-sm space-y-6">
                <div className="border-b border-[#2E1A11]/10 pb-4">
                  <h2 className="font-display font-black text-xl text-[#2E1A11]">
                    Account Settings
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Manage Google authentication link, notification alerts, and active login sessions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#2E1A11]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2E1A11]">Google OAuth Account</div>
                        <div className="text-[11px] text-[#78716C]">{user.email}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#2E1A11]/10 space-y-3">
                    <span className="text-xs font-bold text-[#2E1A11] block">
                      Automated Order Tracking Notifications
                    </span>
                    <p className="text-[11px] text-[#78716C]">
                      Receive automated status updates when your meal moves from handi preparation to rider dispatch.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={logout}
                        className="px-4 py-2 rounded-xl bg-[#FAF5ED] hover:bg-[#F0E6D6] border border-[#2E1A11]/20 text-xs font-bold text-[#35170F] transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} /> Log out of this device
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DANGER ZONE */}
            {activeTab === 'danger' && (
              <div className="p-6 md:p-8 rounded-3xl bg-red-50 border border-red-200 shadow-sm space-y-6">
                <div className="border-b border-red-200 pb-4">
                  <div className="flex items-center gap-2 text-red-700 font-display font-black text-xl">
                    <AlertTriangle size={22} />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-xs text-red-600 mt-0.5">
                    Permanently close your Vindu Ruchulu account.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-red-200 space-y-3">
                  <h3 className="text-xs font-bold text-red-800">
                    Delete Customer Account & Anonymize Personal Data
                  </h3>
                  <p className="text-[11px] text-[#78716C] leading-relaxed">
                    Closing your account will remove your saved Google association, phone number, and delivery addresses. Previous order records will be permanently anonymized for legal and tax accounting purposes.
                  </p>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                  >
                    Delete Account...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: ADD / EDIT DELIVERY ADDRESS */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FFF8EE] rounded-3xl p-6 md:p-8 shadow-2xl border border-[#2E1A11]/10 z-10 space-y-5 animate-scale-up">
            <h3 className="font-display font-black text-xl text-[#2E1A11]">
              {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Address Label Selector */}
              <div>
                <label className="block text-xs font-bold text-[#35170F] mb-1">Tag / Label</label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddrLabel(lbl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        addrLabel === lbl
                          ? 'bg-[#C9281C] text-white border-[#C9281C]'
                          : 'bg-white text-[#2E1A11] border-[#2E1A11]/15'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                    Contact Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                  Flat / House / Building *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sai Residency"
                  value={addrHouse}
                  onChange={(e) => setAddrHouse(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                  Street / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Road No. 36, Near Peddamma Temple"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jubilee Hills"
                    value={addrArea}
                    onChange={(e) => setAddrArea(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="500033"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#35170F] mb-1">
                  Rider Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security / Ring bell twice"
                  value={addrInstructions}
                  onChange={(e) => setAddrInstructions(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2E1A11] pt-1">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C9281C] accent-[#C9281C]"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FAF5ED] border border-[#2E1A11]/20 text-xs font-bold text-[#2E1A11]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C9281C] hover:bg-[#A31F16] text-white text-xs font-bold transition-colors shadow-md shadow-[#C9281C]/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DANGER ZONE CONFIRMATION */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-red-200 z-10 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-display font-black text-xl text-red-800">
                Confirm Account Deletion
              </h3>
              <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                Type <strong>DELETE</strong> below to permanently delete your personal customer profile and unlink your Google account.
              </p>
            </div>

            <div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full h-11 px-3 text-center uppercase tracking-widest font-mono font-bold rounded-xl bg-red-50 border border-red-300 text-red-900 text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountSubmit}
                disabled={deleteConfirmText.trim().toLowerCase() !== 'delete'}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <CustomerAuthModal />
    </div>
  );
}
