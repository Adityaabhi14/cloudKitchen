'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown, Clock, Flame, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-[74px] overflow-hidden bg-gradient-to-b from-[#FAF5ED] via-[#F6EDE0] to-[#FAF5ED] border-b border-[rgba(46,26,17,0.06)]">
      {/* Kolam dot texture */}
      <div className="absolute inset-0 kolam-dots pointer-events-none opacity-40" />

      {/* Main Content Container */}
      <div className="site-container relative z-10 py-12 lg:py-16 min-h-[calc(80vh-74px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-[54%_46%] gap-10 lg:gap-12 items-center w-full">

          {/* Left Column: Brand Statement & CTA */}
          <div className="flex flex-col items-start space-y-6">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8281E]/10 border border-[#C8281E]/20">
              <Flame size={14} className="text-[#C8281E]" />
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#C8281E]">
                Telangana · Andhra · Cloud Kitchen
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[72px] font-black text-[#2E1A11] leading-[1.0] tracking-tight">
                Amma&apos;s{' '}
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #C8281E 0%, #D97706 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Recipes,
                </span>
                <br />
                Tomorrow.
              </h1>
              <p
                className="text-base sm:text-lg text-[#5C3424] font-semibold tracking-wide"
                style={{ fontFamily: 'var(--font-telugu)' }}
              >
                విందు రుచులు · స్వచ్ఛమైన ఇంటి రుచులు
              </p>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#5C3424] max-w-[500px] leading-relaxed">
              Stone-ground masalas. Slow-cooked in brass handis. Guntur chillies, gongura, and authentic wood-fired dum biryani. Order tonight, feast tomorrow.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#menu-section"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#2E1A11] text-[#FAF5ED] font-bold text-sm hover:bg-[#5C3424] transition-all btn-tactile shadow-lg shadow-[#2E1A11]/15"
              >
                <Flame size={16} className="text-[#D97706]" />
                <span>View Tomorrow&apos;s Menu</span>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[rgba(46,26,17,0.2)] text-[#2E1A11] font-bold text-sm hover:border-[#C8281E] hover:text-[#C8281E] bg-white/60 transition-all btn-tactile"
              >
                <span>How It Works</span>
                <ArrowDown size={14} />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-[rgba(46,26,17,0.08)] shadow-sm">
                <Clock size={13} className="text-[#D97706]" />
                <span className="text-xs font-semibold text-[#2E1A11]">Order by 10 PM</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-[rgba(46,26,17,0.08)] shadow-sm">
                <ShieldCheck size={13} className="text-[#166534]" />
                <span className="text-xs font-semibold text-[#2E1A11]">Zero Preservatives</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-[rgba(46,26,17,0.08)] shadow-sm">
                <Flame size={13} className="text-[#C8281E]" />
                <span className="text-xs font-semibold text-[#2E1A11]">Brass Handi Dum</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Food Visual Composition */}
          <div className="relative w-full max-w-[480px] mx-auto lg:ml-auto">
            
            {/* Featured Dish Card */}
            <div className="relative rounded-3xl overflow-hidden bg-[#2E1A11] border border-[#2E1A11]/20 shadow-2xl shadow-[#2E1A11]/25">
              
              {/* Dish Photo */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80"
                  alt="Nawabi Hyderabadi Mutton Dum Biryani"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E1A11] via-[#2E1A11]/30 to-transparent" />
                
                {/* Veg/Non-Veg Tag */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                  <span className="nonveg-dot" />
                  <span>Authentic Dum</span>
                </div>
              </div>

              {/* Dish Info Details */}
              <div className="p-6 pt-2 text-[#FAF5ED] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display font-black text-2xl text-[#FAF5ED] leading-tight">
                      Hyderabadi Dum Biryani
                    </h2>
                    <p className="text-xs text-[#FAF5ED]/70 mt-0.5">
                      Slow-cooked overnight in sealed brass deg over wood embers
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-[#D97706] font-semibold block uppercase">Starts at</span>
                    <span className="text-2xl font-black text-[#FAF5ED] leading-none">₹250</span>
                  </div>
                </div>

                {/* Flavor Profile Badges */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-[#FAF5ED]/90 font-medium">
                    🌶️ Guntur Spices
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-[#FAF5ED]/90 font-medium">
                    🥘 Dum Cooked
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-[#FAF5ED]/90 font-medium">
                    ✨ Pure Ghee
                  </span>
                </div>
              </div>
            </div>

            {/* Intentional Floating Supporting Elements (2 only, clean) */}
            <div className="absolute -top-4 -right-3 sm:-right-4 bg-[#C8281E] text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2">
              <Sparkles size={14} className="text-[#FDE68A]" />
              <span className="text-xs font-black uppercase tracking-wider">Fresh Daily</span>
            </div>

            <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-white text-[#2E1A11] px-4 py-2.5 rounded-2xl shadow-xl border border-[rgba(46,26,17,0.1)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#166534]/10 flex items-center justify-center text-[#166534] font-bold">
                ✓
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black text-[#2E1A11]">100% Home Style</p>
                <p className="text-[10px] text-[#78716C]">Zero Additives</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
