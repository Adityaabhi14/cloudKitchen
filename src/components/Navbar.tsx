'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Flame,
  Menu,
  X,
  ChevronRight,
  User,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function Navbar() {
  const { itemCount, setIsCartOpen, setIsTrackModalOpen } = useCart();
  const { user, openAuthModal, logout } = useCustomerAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#FAF5ED] shadow-sm border-b border-[rgba(46,26,17,0.08)]'
            : 'bg-[#FAF5ED]/95 border-b border-transparent'
        }`}
      >
        <div className="site-container">
          <div className="flex items-center justify-between h-[74px]">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8281E] to-[#D97706] flex items-center justify-center shadow-md shadow-[#C8281E]/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Flame size={20} className="text-white fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl text-[#2E1A11] tracking-tight leading-none">
                  Vindu Ruchulu
                </span>
                <span
                  className="text-[11px] text-[#78716C] font-semibold tracking-wider uppercase mt-0.5"
                  style={{ fontFamily: 'var(--font-telugu)' }}
                >
                  విందు రుచులు · Cloud Kitchen
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              <a
                href="#menu-section"
                className="text-sm font-semibold text-[#2E1A11] hover:text-[#C8281E] transition-colors"
              >
                Tomorrow&apos;s Menu
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-[#2E1A11] hover:text-[#C8281E] transition-colors"
              >
                How It Works
              </a>
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="text-sm font-semibold text-[#2E1A11] hover:text-[#C8281E] transition-colors"
              >
                Track Order
              </button>
            </nav>

            {/* Right Actions: User Account + Cart + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Customer Account Avatar / Login */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white hover:bg-[#FFF3E0] border border-[#2E1A11]/10 transition-all text-left shadow-sm"
                    aria-label="User profile menu"
                  >
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#2E1A11]/10 bg-[#FAF5ED]"
                    />
                    <span className="text-xs font-bold text-[#2E1A11] max-w-[100px] truncate hidden sm:inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-[#78716C]" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FFF8EE] rounded-2xl shadow-xl border border-[#2E1A11]/10 py-2 z-50 animate-scale-up">
                      <div className="px-4 py-2 border-b border-[#2E1A11]/5">
                        <div className="font-bold text-xs text-[#2E1A11] truncate">{user.name}</div>
                        <div className="text-[11px] text-[#78716C] truncate">{user.email}</div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile?tab=profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2E1A11] hover:bg-[#FFF3E0] transition-colors"
                        >
                          <User size={14} className="text-[#C9281C]" /> My Profile
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2E1A11] hover:bg-[#FFF3E0] transition-colors"
                        >
                          <ShoppingBag size={14} className="text-[#E65100]" /> My Orders
                        </Link>
                        <Link
                          href="/profile?tab=addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2E1A11] hover:bg-[#FFF3E0] transition-colors"
                        >
                          <MapPin size={14} className="text-[#2E7D32]" /> Saved Addresses
                        </Link>
                        <Link
                          href="/profile?tab=favorites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2E1A11] hover:bg-[#FFF3E0] transition-colors"
                        >
                          <Heart size={14} className="text-[#C9281C]" /> Favourites
                        </Link>
                        <Link
                          href="/profile?tab=settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2E1A11] hover:bg-[#FFF3E0] transition-colors"
                        >
                          <Settings size={14} className="text-[#78716C]" /> Settings
                        </Link>
                      </div>

                      <div className="border-t border-[#2E1A11]/5 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#FFF3E0] text-[#2E1A11] border border-[#2E1A11]/15 text-xs font-bold transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>Sign In</span>
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#2E1A11] text-[#FAF5ED] hover:bg-[#5C3424] transition-all btn-tactile shadow-md shadow-[#2E1A11]/15"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={17} />
                <span className="text-xs font-bold tracking-wide uppercase">Cart</span>
                {itemCount > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[#C8281E] text-white text-[11px] font-black flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#2E1A11] hover:bg-[#2E1A11]/5 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-[74px] left-0 right-0 bg-[#FAF5ED] border-b border-[#2E1A11]/10 shadow-2xl p-5 space-y-2">
            {user ? (
              <div className="p-3 bg-white rounded-2xl border border-[#2E1A11]/10 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover bg-[#FAF5ED]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#2E1A11]">{user.name}</div>
                    <div className="text-[11px] text-[#78716C]">{user.email}</div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-[#C9281C]"
                >
                  View →
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openAuthModal();
                }}
                className="w-full h-11 rounded-2xl bg-white border border-[#DADCE0] text-[#3C4043] font-bold text-xs flex items-center justify-center gap-2 shadow-sm mb-2"
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
                <span>Continue with Google</span>
              </button>
            )}

            <a
              href="#menu-section"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#2E1A11] hover:bg-[#2E1A11]/5 transition-colors"
            >
              Tomorrow&apos;s Menu
              <ChevronRight size={16} className="text-[#78716C]" />
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#2E1A11] hover:bg-[#2E1A11]/5 transition-colors"
            >
              How It Works
              <ChevronRight size={16} className="text-[#78716C]" />
            </a>
            <button
              onClick={() => {
                setMobileOpen(false);
                setIsTrackModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#2E1A11] hover:bg-[#2E1A11]/5 transition-colors text-left"
            >
              Track Order
              <ChevronRight size={16} className="text-[#78716C]" />
            </button>
            {user && (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-[#C9281C] hover:bg-[#C9281C]/5 transition-colors"
              >
                Customer Profile
                <ChevronRight size={16} className="text-[#C9281C]" />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

