'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerUser, CustomerAddress } from '@/types';

interface CustomerAuthContextType {
  user: CustomerUser | null;
  isLoading: boolean;
  loginWithGoogle: (
    profileData?: { name?: string; email?: string; phone?: string; profileImage?: string; googleId?: string },
    returnUrl?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; notificationsEnabled?: boolean; marketingEnabled?: boolean; profileImage?: string }) => Promise<boolean>;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<CustomerAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  toggleFavorite: (foodItemId: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authReturnUrl: string;
  openAuthModal: (returnUrl?: string) => void;
  closeAuthModal: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authReturnUrl, setAuthReturnUrl] = useState<string>('');

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/customer/session');
      const data = await res.json();
      const customerData = data.data?.user || data.data;
      if (data.success && customerData && customerData.email) {
        setUser(customerData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore customer session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (returnUrl?: string) => {
    if (returnUrl) setAuthReturnUrl(returnUrl);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (
    profileData?: { name?: string; email?: string; phone?: string; profileImage?: string; googleId?: string },
    returnUrl?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Default sample authentic user if clicking quick login
      const payload = {
        googleId: profileData?.googleId || `goog_user_${Date.now()}`,
        email: profileData?.email || 'sri.prabhakar@gmail.com',
        name: profileData?.name || 'Dr. K. Prabhakar Rao',
        profileImage: profileData?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: profileData?.phone || '+91 98490 12345',
      };

      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data?.customer) {
        setUser(data.data.customer);
        setIsAuthModalOpen(false);

        const target = returnUrl || authReturnUrl;
        if (target && target !== '/login') {
          router.push(target);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      return { success: false, error: 'Network error during Google login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/customer/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    notificationsEnabled?: boolean;
    marketingEnabled?: boolean;
    profileImage?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setUser(resData.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addAddress = async (address: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateAddress = async (id: string, address: Partial<CustomerAddress>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auth/customer/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auth/customer/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auth/customer/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleFavorite = async (foodItemId: string): Promise<boolean> => {
    if (!user) {
      openAuthModal();
      return false;
    }
    try {
      const res = await fetch('/api/auth/customer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItemId }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.favorites)) {
        setUser((prev) => (prev ? { ...prev, favorites: data.data.favorites } : null));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/customer/account', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        router.push('/');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        logout,
        refreshUser,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        toggleFavorite,
        deleteAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authReturnUrl,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
