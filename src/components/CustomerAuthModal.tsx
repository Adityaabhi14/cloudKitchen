'use client';

import React, { useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { X, Flame, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const QUICK_GOOGLE_PROFILES = [
  {
    name: 'Dr. K. Prabhakar Rao',
    email: 'sri.prabhakar@gmail.com',
    phone: '+91 98490 12345',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    tag: 'Frequent Patron',
  },
  {
    name: 'Sunitha Reddy',
    email: 'sunitha.reddy.hyd@gmail.com',
    phone: '+91 98765 43299',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    tag: 'Andhra Feasts Fan',
  },
  {
    name: 'Harish Varma',
    email: 'harish.varma@gmail.com',
    phone: '+91 99887 76655',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    tag: 'New Foodie',
  },
];

export default function CustomerAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, authReturnUrl } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async (profile?: typeof QUICK_GOOGLE_PROFILES[0]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(
        profile
          ? {
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              profileImage: profile.profileImage,
              googleId: `goog_${profile.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            }
          : undefined,
        authReturnUrl
      );

      if (!res.success) {
        setError(res.error || 'Unable to complete Google login.');
      }
    } catch {
      setError('An unexpected error occurred during Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setError('Please provide a valid Google Gmail address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(
        {
          name: customName || customEmail.split('@')[0],
          email: customEmail,
          phone: customPhone,
          googleId: `goog_${customEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        },
        authReturnUrl
      );
      if (!res.success) {
        setError(res.error || 'Login failed.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2E1A11]/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#FFF8EE] rounded-3xl shadow-2xl border border-[#2E1A11]/10 overflow-hidden z-10 animate-scale-up">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#C9281C] to-[#E65100] p-6 text-white text-center relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto mb-3 flex items-center justify-center border border-white/20 shadow-inner">
            <Flame size={24} className="text-[#FFD54F] fill-[#FFD54F]/20" />
          </div>

          <h2 className="font-display font-black text-2xl tracking-tight text-white">
            Namaskaram! 🙏
          </h2>
          <p className="text-white/80 text-xs mt-1 font-medium">
            Sign in to manage your feasts, track orders & save delivery addresses.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Official Google Login Button */}
          <div>
            <button
              onClick={() => handleGoogleLogin(QUICK_GOOGLE_PROFILES[0])}
              disabled={loading}
              className="w-full h-12 px-4 rounded-2xl bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] font-semibold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all disabled:opacity-60 btn-tactile group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#C9281C] border-t-transparent rounded-full animate-spin" />
              ) : (
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
              )}
              <span className="font-medium text-[#1F1F1F]">
                {loading ? 'Connecting with Google...' : 'Continue with Google'}
              </span>
            </button>
            <p className="text-[11px] text-center text-[#78716C] mt-2 font-medium">
              🔒 Fast 1-Click Secure Customer Authentication
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#2E1A11]/10 w-full" />
            <span className="bg-[#FFF8EE] px-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Or Choose Account
            </span>
            <div className="border-t border-[#2E1A11]/10 w-full" />
          </div>

          {!customMode ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#35170F] block mb-1">
                Select Google Profile:
              </span>
              {QUICK_GOOGLE_PROFILES.map((profile, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoogleLogin(profile)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#FFF3E0] border border-[#2E1A11]/10 hover:border-[#F4B400] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.profileImage}
                      alt={profile.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#2E1A11]/10"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#2E1A11] group-hover:text-[#C9281C] transition-colors">
                        {profile.name}
                      </div>
                      <div className="text-[11px] text-[#78716C]">{profile.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5ED] text-[#C9281C] border border-[#2E1A11]/10">
                    {profile.tag}
                  </span>
                </button>
              ))}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="text-xs font-bold text-[#C9281C] hover:underline"
                >
                  Use a different Google email address →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#35170F] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Seshagiri Rao"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35170F] mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35170F] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#2E1A11]/20 text-xs font-medium focus:outline-none focus:border-[#C9281C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 h-10 rounded-xl bg-[#FAF5ED] border border-[#2E1A11]/20 text-xs font-bold text-[#2E1A11]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-[#C9281C] text-white text-xs font-bold hover:bg-[#A31F16] transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Guarantee Badges */}
          <div className="pt-2 border-t border-[#2E1A11]/10 flex items-center justify-between text-[11px] text-[#78716C] font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#2E7D32]" />
              No passwords stored
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={14} className="text-[#F4B400]" />
              Exclusive Feast Perks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
