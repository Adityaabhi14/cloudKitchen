'use client';

import React from 'react';
import { CalendarDays, Clock, Flame, Truck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: CalendarDays,
    title: 'Daily Curated Menu',
    desc: 'Each afternoon, Amma designs a fresh rotating menu of authentic Telangana & Andhra home-style specialties.',
  },
  {
    step: '02',
    icon: Clock,
    title: 'Order Before 10 PM',
    desc: 'Place your pre-order online by 10:00 PM tonight so we can source fresh country meats & produce at dawn.',
  },
  {
    step: '03',
    icon: Flame,
    title: 'Slow-Cooked Overnight',
    desc: 'Prepared in limited batches using heavy brass handis, wood-fired dum, and stone-ground spice masalas.',
  },
  {
    step: '04',
    icon: Truck,
    title: 'Delivered Hot & Fresh',
    desc: 'Packed in food-grade insulated thermal containers and delivered fresh for your chosen lunch or dinner slot.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#F4EBDC] border-y border-[rgba(46,26,17,0.06)]">
      <div className="site-container">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#C8281E] bg-[#C8281E]/10 border border-[#C8281E]/20 px-3.5 py-1 rounded-full inline-block">
            Simple Process
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2E1A11] tracking-tight">
            How Next-Day Ordering Works
          </h2>
          <p className="text-sm sm:text-base text-[#5C3424]/80">
            We cook in limited, made-to-order dawn batches to guarantee 100% freshness with zero food waste.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="bg-white rounded-2xl p-6 border border-[rgba(46,26,17,0.08)] shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              {/* Step Number Top-Right */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#2E1A11] flex items-center justify-center text-[#FAF5ED] shadow-sm">
                  <Icon size={20} className="text-[#D97706]" />
                </div>
                <span className="font-display font-black text-2xl text-[#2E1A11]/20">
                  {step}
                </span>
              </div>

              {/* Step Details */}
              <div className="space-y-1.5 flex-1">
                <h3 className="font-display font-bold text-lg text-[#2E1A11]">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3424]/80 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
