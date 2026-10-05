'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Utensils,
  CalendarDays,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Flame,
  Menu,
  X,
  Users,
  BarChart2,
  Tag,
  Star,
  ClipboardList,
  CreditCard,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'OPERATIONS',
    items: [
      { href: '/admin',        icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/orders', icon: ShoppingBag,     label: 'Orders' },
      { href: '/admin/menu',   icon: CalendarDays,    label: 'Menu Planner' },
      { href: '/admin/items',  icon: Utensils,        label: 'Food Items' },
    ],
  },
  {
    label: 'CUSTOMERS',
    items: [
      { href: '/admin/customers', icon: Users, label: 'Customers' },
      { href: '/admin/reviews',   icon: Star,  label: 'Reviews' },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { href: '/admin/analytics',  icon: BarChart2,   label: 'Analytics' },
      { href: '/admin/payments',   icon: CreditCard,  label: 'Payments' },
      { href: '/admin/promotions', icon: Tag,         label: 'Promotions' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/settings', icon: Settings,      label: 'Settings' },
      { href: '/admin/audit',    icon: ClipboardList, label: 'Audit Log' },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [adminName,     setAdminName]     = useState('Chef Admin');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [kitchenOpen,   setKitchenOpen]   = useState(true);
  const [isAuthChecking,setIsAuthChecking]= useState(true);

  // Robust server-validated auth check
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (!data.success) {
          // Check localStorage token fallback
          const localToken = localStorage.getItem('vindu_admin_token');
          if (!localToken) {
            router.replace('/admin/login');
            return;
          }
        } else if (data.data?.name && isMounted) {
          setAdminName(data.data.name);
        }
      } catch {
        const localToken = localStorage.getItem('vindu_admin_token');
        if (!localToken) {
          router.replace('/admin/login');
          return;
        }
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  // Live order counts & kitchen status polling
  useEffect(() => {
    const poll = async () => {
      try {
        const [ordersRes, settingsRes] = await Promise.all([
          fetch('/api/orders').then(r => r.json()),
          fetch('/api/settings').then(r => r.json()),
        ]);

        if (ordersRes.success && Array.isArray(ordersRes.data)) {
          const count = ordersRes.data.filter(
            (o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.order_status === 'PENDING' || o.order_status === 'CONFIRMED'
          ).length;
          setPendingOrders(count);
        }

        if (settingsRes.success && settingsRes.data?.settings) {
          const st = settingsRes.data.settings;
          setKitchenOpen(st.isAcceptingOrders ?? st.is_accepting_orders ?? true);
        }
      } catch {
        // silent
      }
    };
    poll();
    const id = setInterval(poll, 25_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // silent
    }
    localStorage.removeItem('vindu_admin_token');
    router.replace('/admin/login');
  }, [router]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/menu' && pathname === '/admin/menu-planner') return true;
    if (href === '/admin/items' && pathname === '/admin/food-items') return true;
    if (href === '/admin/audit' && pathname === '/admin/audit-log') return true;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-[64px] border-b border-white/10 flex-shrink-0 bg-[#24100B]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9281C] to-[#F57C00] flex items-center justify-center flex-shrink-0 shadow-md">
          <Flame size={19} className="text-white fill-white/20" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#FFF8EE] truncate leading-tight font-display">
              Vindu Ruchulu
            </p>
            <p className="text-[10px] text-[#F4B400] font-bold uppercase tracking-wider">
              Kitchen Control Center
            </p>
          </div>
        )}
      </div>

      {/* Live Kitchen Status Indicator */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-[#35170F]/80 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#C4AEA5] uppercase tracking-wider">Kitchen Status</span>
          <span className={`text-[11px] font-black uppercase flex items-center gap-1.5 ${kitchenOpen ? 'text-[#228B45]' : 'text-[#E33B24]'}`}>
            <span className={`w-2 h-2 rounded-full ${kitchenOpen ? 'bg-[#228B45] animate-pulse' : 'bg-[#E33B24]'}`} />
            {kitchenOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      )}

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed && (
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C4AEA5]/70">
                {group.label}
              </p>
            )}
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`admin-nav-item ${active ? 'active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} className={`nav-icon ${active ? 'text-[#F4B400]' : 'text-[#C4AEA5]'}`} />
                  {!collapsed && <span className="flex-1 font-medium">{label}</span>}
                  {!collapsed && label === 'Orders' && pendingOrders > 0 && (
                    <span className="ml-auto bg-[#F57C00] text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {pendingOrders}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile & logout */}
      <div className="border-t border-white/10 p-3 flex-shrink-0 bg-[#24100B]">
        <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F57C00] to-[#C9281C] flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow">
            {adminName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FFF8EE] truncate">{adminName}</p>
              <p className="text-[10px] text-[#C4AEA5]">Kitchen Manager</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-[#C4AEA5] hover:text-[#E33B24] hover:bg-white/10 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center justify-center p-2 rounded-md text-[#C4AEA5] hover:text-[#E33B24] hover:bg-white/10 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </>
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-[#35170F]">
          <div className="w-8 h-8 rounded-full border-2 border-[#C9281C] border-t-transparent animate-spin" />
          <p className="text-xs font-bold">Verifying kitchen session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* ── Desktop Sidebar ── */}
      <aside className={`admin-sidebar hidden lg:flex flex-col ${collapsed ? 'collapsed' : ''}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-[#35170F] border border-white/20 flex items-center justify-center text-[#FFF8EE] hover:bg-[#C9281C] transition-colors z-20 shadow-md"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[260px] h-full bg-[#24100B] flex flex-col shadow-2xl border-r border-white/10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-[#C4AEA5] hover:text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Layout Content ── */}
      <main className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-[#35170F] hover:bg-[#35170F]/5"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#24100B] truncate font-display">
              {title || 'Kitchen Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Store */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-[#35170F] hover:text-[#C9281C] border border-[rgba(53,23,15,0.15)] bg-white rounded-lg px-3 py-1.5 transition-colors shadow-sm"
            >
              <Flame size={14} className="text-[#F57C00]" />
              <span className="hidden sm:inline">View Storefront</span>
            </Link>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-[#35170F] hover:bg-[#35170F]/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {pendingOrders > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9281C]" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
