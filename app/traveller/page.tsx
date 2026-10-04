'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Car, ShieldCheck, MapPin, ArrowRight, DollarSign, Sparkles, CheckCircle } from 'lucide-react';

export default function TravellerLandingPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-12">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-route-100 px-3.5 py-1 text-xs font-semibold text-route-900 border border-route-200">
              <Sparkles className="h-3.5 w-3.5 text-route-600" />
              <span>Route Pooling Ecosystem</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Earn on the journey <br />
              <span className="text-route-600">you are already making.</span>
            </h1>

            <p className="text-base text-slate-600 max-w-xl leading-relaxed">
              Don&apos;t make dedicated, wasteful delivery trips. When you commute between cities, towns, or sectors, pool small packages heading your exact way and get paid instantly upon delivery confirmation.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Link
                  href="/traveller/dashboard"
                  className="rounded-xl bg-route-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-route-700 transition-all flex items-center space-x-2"
                >
                  <span>Go to Traveller Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register?role=TRAVELLER"
                  className="rounded-xl bg-route-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-route-700 transition-all flex items-center space-x-2"
                >
                  <span>Register as Traveller</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <Link
                href="/traveller/trips/new"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Declare a Trip
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-route-200 bg-route-50/50 p-6 shadow-lg space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Why Deliver with Route Pooling?</h3>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-route-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Empty Return Trips:</strong> You only carry items on trips you were already traveling.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-route-600 shrink-0 mt-0.5" />
                  <span><strong>Transparent Payouts:</strong> Earn 80% of the customer delivery fee directly into your wallet.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-route-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-Package Pooling:</strong> Carry up to 10 packages from 3-4 shops to the same destination.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-route-600 shrink-0 mt-0.5" />
                  <span><strong>Secure OTP Verification:</strong> Customers release a 6-digit PIN upon handover to prevent disputes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
