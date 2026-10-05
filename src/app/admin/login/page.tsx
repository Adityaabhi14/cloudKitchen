'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  // If already authenticated via session API or token → redirect to /admin
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.success && isMounted) {
          router.replace('/admin');
          return;
        }
      } catch {
        // silent
      } finally {
        if (isMounted) setChecking(false);
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        localStorage.setItem('vindu_admin_token', json.data.token);
        router.replace('/admin');
      } else {
        setError(json.error || 'Invalid username or password');
      }
    } catch {
      setError('Unable to connect to kitchen server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9281C] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8EE] via-[#FAF1E2] to-[#FFF8EE] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="bg-white border border-[rgba(53,23,15,0.12)] rounded-3xl p-8 shadow-xl shadow-[#35170F]/5 animate-fade-slide">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9281C] to-[#F57C00] flex items-center justify-center mb-3 shadow-lg shadow-[#C9281C]/20">
              <Flame size={28} className="text-white fill-white/20" />
            </div>
            <h1 className="text-2xl font-black text-[#24100B] font-display tracking-tight">
              Vindu Ruchulu
            </h1>
            <p className="text-xs font-bold text-[#F57C00] uppercase tracking-wider mt-1">
              Kitchen Control Center Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">Admin Username</label>
              <div className="relative flex items-center">
                <User
                  size={18}
                  className="absolute left-3.5 text-[#78716C] pointer-events-none z-10"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="admin-input !pl-11 !pr-4 py-3 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Secret Password</label>
              <div className="relative flex items-center">
                <Lock
                  size={18}
                  className="absolute left-3.5 text-[#78716C] pointer-events-none z-10"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="admin-input !pl-11 !pr-11 py-3 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 p-1 rounded-lg text-[#78716C] hover:text-[#24100B] hover:bg-[#FAF1E2] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#C9281C]/10 border border-[#C9281C]/25 text-[#C9281C] text-xs font-semibold animate-fade-slide">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#24100B] hover:bg-[#35170F] text-[#FFF8EE] font-bold text-sm shadow-md transition-all btn-tactile disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Kitchen Desk</span>
                  <ArrowRight size={16} className="text-[#F4B400]" />
                </>
              )}
            </button>
          </form>

          {/* Credentials Hint */}
          <div className="mt-6 pt-4 border-t border-[rgba(53,23,15,0.08)] text-center text-xs text-[#78716C]">
            <span>Default Kitchen Admin: </span>
            <code className="bg-[#FAF1E2] px-1.5 py-0.5 rounded font-bold text-[#24100B]">admin</code>
            <span> / </span>
            <code className="bg-[#FAF1E2] px-1.5 py-0.5 rounded font-bold text-[#24100B]">admin123</code>
          </div>

        </div>

      </div>
    </div>
  );
}
