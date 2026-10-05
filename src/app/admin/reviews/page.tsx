'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  { id: '1', customer: 'Ananya Reddy', dish: 'Nawabi Hyderabadi Mutton Dum Biryani', rating: 5, comment: 'The mutton was melt-in-mouth tender! Felt just like authentic home wedding style food.', date: 'Yesterday' },
  { id: '2', customer: 'Karthik Varma', dish: 'Gongura Mutton Curry', rating: 5, comment: 'True Andhra spice level with original red-stem gongura. Absolutely fantastic flavor balance.', date: '2 days ago' },
  { id: '3', customer: 'Srinivas Rao', dish: 'Telangana Bagara Rice with Natukodi', rating: 5, comment: 'Bagara rice aroma was incredible. Delivered piping hot right at 12:45 PM in sealed container.', date: '3 days ago' },
  { id: '4', customer: 'Deepika S.', dish: 'Gutti Vankaya Kura', rating: 4, comment: 'Very authentic peanut-sesame masala gravy. Loved the tender baby brinjals.', date: '4 days ago' },
];

export default function ReviewsPage() {
  return (
    <AdminLayout title="Customer Reviews & Feedback">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
            Patron Feedback & Testimonials
          </h2>
          <p className="text-xs text-[#6E5147] mt-0.5">
            Average customer rating: ⭐ <strong>4.92 / 5.0</strong> (across 86 verified pre-orders)
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.id} className="bg-white border border-[rgba(53,23,15,0.12)] rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#F57C00] transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm text-[#24100B]">{r.customer}</p>
                  <p className="text-xs font-medium text-[#C9281C] mt-0.5">{r.dish}</p>
                </div>
                <div className="flex text-[#F4B400] gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#24100B] leading-relaxed italic bg-[#FFF8EE] p-3.5 rounded-xl border border-[rgba(53,23,15,0.08)]">
                &ldquo;{r.comment}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#6E5147] pt-1">
                <span className="flex items-center gap-1 text-[#228B45] font-bold">
                  <CheckCircle2 size={12} />
                  <span>Verified Pre-order Customer</span>
                </span>
                <span className="font-medium">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
