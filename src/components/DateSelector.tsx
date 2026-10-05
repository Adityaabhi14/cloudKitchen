'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Calendar, Check } from 'lucide-react';

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useCart();

  // Generate date options: Today, Tomorrow, +2, +3, +4
  const dateOptions = Array.from({ length: 5 }).map((_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoKey = `${year}-${month}-${day}`;

    const isToday = offset === 0;
    const isTomorrow = offset === 1;

    const label = isTomorrow
      ? 'Tomorrow'
      : isToday
      ? 'Today'
      : d.toLocaleDateString('en-IN', { weekday: 'short' });

    const formattedDay = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return {
      isoKey,
      label,
      formattedDay,
      isTomorrow,
      isToday,
    };
  });

  return (
    <div className="w-full bg-white border border-[rgba(46,26,17,0.08)] rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2E1A11] text-[#FAF5ED] flex items-center justify-center font-bold shadow-sm">
            <Calendar size={14} className="text-[#D97706]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#2E1A11]">
              Select Dining Date
            </h3>
            <p className="text-[11px] text-[#78716C]">
              Every dish is prepped fresh for your chosen date
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#2E1A11] bg-[#FAF5ED] px-3 py-1 rounded-full border border-[rgba(46,26,17,0.1)] self-start sm:self-auto">
          Cutoff: 10:00 PM Tonight
        </span>
      </div>

      {/* Date Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {dateOptions.map((item) => {
          const isSelected = selectedDate === item.isoKey;
          return (
            <button
              key={item.isoKey}
              type="button"
              onClick={() => setSelectedDate(item.isoKey)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all btn-tactile ${
                isSelected
                  ? 'bg-[#2E1A11] text-[#FAF5ED] border-[#2E1A11] shadow-md'
                  : 'bg-[#FAF5ED] text-[#2E1A11] border-[rgba(46,26,17,0.08)] hover:bg-white hover:border-[rgba(46,26,17,0.18)]'
              }`}
            >
              {item.isTomorrow && (
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md mb-1 ${
                  isSelected ? 'bg-[#D97706] text-slate-950' : 'bg-[#D97706]/20 text-[#D97706]'
                }`}>
                  Popular
                </span>
              )}
              <span className={`text-[11px] uppercase tracking-wider font-semibold ${
                isSelected ? 'text-[#FAF5ED]/80' : 'text-[#78716C]'
              }`}>
                {item.label}
              </span>
              <span className="text-xs sm:text-sm font-extrabold mt-0.5 font-display">
                {item.formattedDay}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check size={12} className="text-[#D97706]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
