'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ClipboardList, Shield, CheckCircle2 } from 'lucide-react';

const AUDIT_LOGS = [
  { id: '1', action: 'MENU_PUBLISHED', user: 'Chef Admin', details: "Published menu for tomorrow's dawn batch (8 dishes)", timestamp: '10 mins ago' },
  { id: '2', action: 'ORDER_STATUS_CHANGED', user: 'Chef Admin', details: 'Order #TEL-10482 advanced to PREPARING', timestamp: '24 mins ago' },
  { id: '3', action: 'STOCK_UPDATED', user: 'Chef Admin', details: 'Added +10 portions to Hyderabadi Mutton Dum Biryani', timestamp: '1 hour ago' },
  { id: '4', action: 'SETTINGS_MODIFIED', user: 'Chef Admin', details: 'Updated standard delivery fee to ₹40', timestamp: '3 hours ago' },
  { id: '5', action: 'ADMIN_LOGIN', user: 'admin', details: 'Authenticated session established from kitchen terminal', timestamp: '5 hours ago' },
];

export default function AuditPage() {
  return (
    <AdminLayout title="System Security & Audit Trail">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="pb-2 border-b border-[rgba(53,23,15,0.1)]">
          <h2 className="text-xl sm:text-2xl font-black text-[#24100B] tracking-tight font-display">
            Security & Operations Audit Trail
          </h2>
          <p className="text-xs text-[#6E5147] mt-0.5">
            Immutable log of menu publishing, stock updates, order state transitions, and administrative access
          </p>
        </div>

        {/* Audit Table */}
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Action</th>
                  <th>Operator</th>
                  <th>Activity Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-[#FFF8EE] border border-[rgba(53,23,15,0.1)] text-[#C9281C]">
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-[#24100B]">
                      {log.user}
                    </td>
                    <td className="text-xs text-[#6E5147] font-medium">
                      {log.details}
                    </td>
                    <td className="text-xs text-[#6E5147] font-mono">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
