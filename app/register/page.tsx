'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Store, Car, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { UserRole } from '@/types/auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'CUSTOMER';

  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'LocalMesh';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      login(data.user);

      if (role === 'SHOP') {
        router.push('/shop/setup');
      } else if (role === 'TRAVELLER') {
        router.push('/traveller/verification');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      setError('An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-xl shadow-md">
            LM
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Join {brandName}</h2>
          <p className="text-xs text-slate-500">Choose your account type to get started</p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${
              role === 'CUSTOMER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4 mb-1 text-brand-600" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SHOP')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${
              role === 'SHOP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="h-4 w-4 mb-1 text-blue-600" />
            <span>Local Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('TRAVELLER')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${
              role === 'TRAVELLER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="h-4 w-4 mb-1 text-route-600" />
            <span>Traveller</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {role === 'SHOP' ? 'Owner / Contact Full Name' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

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
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Creating Account...' : `Register as ${role}`}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
