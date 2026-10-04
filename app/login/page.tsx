'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, Sparkles, Shield, Store, Car, User } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sign in');
        setLoading(false);
        return;
      }

      login(data.user);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        switch (data.user.role) {
          case 'SHOP':
            router.push('/shop/dashboard');
            break;
          case 'TRAVELLER':
            router.push('/traveller/dashboard');
            break;
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/customer/dashboard');
            break;
        }
      }
    } catch (err: any) {
      setError('An error occurred during sign in');
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-xl shadow-md">
            LM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to {brandName}</h2>
          <p className="text-xs text-slate-500">Access your local shopping, shop inventory, or route trips</p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Quick Demo Fill Buttons */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>One-Click Dev / Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => quickFill('customer@demo.local')}
              className="flex items-center space-x-1 rounded bg-white px-2 py-1.5 font-medium text-slate-700 border border-slate-200 hover:border-brand-500 hover:bg-brand-50"
            >
              <User className="h-3 w-3 text-brand-600" />
              <span>Customer Demo</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('shop@demo.local')}
              className="flex items-center space-x-1 rounded bg-white px-2 py-1.5 font-medium text-slate-700 border border-slate-200 hover:border-brand-500 hover:bg-brand-50"
            >
              <Store className="h-3 w-3 text-blue-600" />
              <span>Shop Merchant</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('traveller@demo.local')}
              className="flex items-center space-x-1 rounded bg-white px-2 py-1.5 font-medium text-slate-700 border border-slate-200 hover:border-brand-500 hover:bg-brand-50"
            >
              <Car className="h-3 w-3 text-route-600" />
              <span>Traveller Demo</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('admin@demo.local')}
              className="flex items-center space-x-1 rounded bg-white px-2 py-1.5 font-medium text-slate-700 border border-slate-200 hover:border-brand-500 hover:bg-brand-50"
            >
              <Shield className="h-3 w-3 text-purple-600" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Do not have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
