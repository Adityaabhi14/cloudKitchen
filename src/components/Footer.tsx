'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Flame } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2E1A11] text-[#FAF5ED] border-t-2 border-[#D97706]">
      <div className="site-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Ethos */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8281E] to-[#D97706] flex items-center justify-center text-white font-bold shadow">
                <Flame size={18} />
              </div>
              <div>
                <span className="font-display font-black text-xl text-[#FAF5ED] block leading-tight">
                  Vindu Ruchulu
                </span>
                <span
                  className="text-[10px] text-[#FAF5ED]/60 uppercase tracking-widest block"
                  style={{ fontFamily: 'var(--font-telugu)' }}
                >
                  విందు రుచులు
                </span>
              </div>
            </div>
            <p className="text-xs text-[#FAF5ED]/75 leading-relaxed">
              Authentic Telangana & Andhra Home-Style Feasts. Slow-cooked fresh in limited dawn batches exclusively on pre-orders.
            </p>
            <div className="text-xs text-[#D97706] font-semibold pt-1">
              Guntur Chillies • Wood-Fired Dum • Cold-Pressed Oils
            </div>
          </div>

          {/* Ordering Schedule */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#D97706] uppercase tracking-wider">
              Operating Schedule
            </h4>
            <div className="space-y-2 text-xs text-[#FAF5ED]/85">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span>Ordering Cutoff:</span>
                <strong className="text-white">10:00 PM Tonight</strong>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span>Lunch Delivery:</span>
                <strong className="text-white">12:30 PM - 2:00 PM</strong>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span>Dinner Delivery:</span>
                <strong className="text-white">7:30 PM - 9:00 PM</strong>
              </div>
            </div>
          </div>

          {/* Kitchen Hub */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#D97706] uppercase tracking-wider">
              Kitchen Hub
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF5ED]/85">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C8281E] shrink-0 mt-0.5" />
                <span>Plot 42, Road No. 36, Jubilee Hills, Hyderabad 500033</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>orders@vinduruchulu.com</span>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#D97706] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF5ED]/85">
              <li>
                <a href="#menu-section" className="hover:text-white transition-colors">
                  Tomorrow&apos;s Menu
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How Next-Day Ordering Works
                </a>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Existing Order
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D97706] font-bold text-xs transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>Kitchen Admin Desk</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-[#FAF5ED]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Vindu Ruchulu Cloud Kitchen. All rights reserved.</span>
          <span>Crafted with love for authentic Telangana & Andhra food traditions.</span>
        </div>
      </div>
    </footer>
  );
}
